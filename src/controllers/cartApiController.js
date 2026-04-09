const {
  throwNewError,
  updateProductStock,
  getCartPopulateOptions,
} = require("../utils");
// const { User } = require("../models/user");
const { Cart } = require("../models/cart");
const { Product } = require("../models/products");
/* Explanation: This controller module implements the cart feature: reading a cart, adding/removing items, and deleting items/carts. It demonstrates several important backend concepts: (1) request-scoped identity (the current user/cart id is expected to be attached to `req` by middleware), (2) database consistency when multiple documents interact (Cart items change and Product stock changes), and (3) error handling through `throwNewError` + `next(err)` so a central error handler formats responses consistently.The models represent collections: `User` and `Cart` store user/cart documents, and `Product` stores product inventory. A cart is effectively a “collection of line items” where each line item references a product and tracks quantity (`unitsToBuy`). The controller also uses `populate` to return cart items with product details, which is a common API design choice: the frontend often wants enriched product info without making N additional calls. */

const getCart = async (req, res, next) => {
  try {
    if (!req.cartId) return res.status(200).json({ success: true, data: null });

    const cart = await Cart.findById(req.cartId).populate(
      getCartPopulateOptions(req.userId),
    );

    if (!cart) throw throwNewError(404, "Cart is empty.");

    // Check our virtual 'isExpired' logic
    if (cart.isExpired) {
      cart.status = "abandoned";
      await cart.save();
      throw throwNewError(400, "Your cart has expired due to inactivity.");
    }

    res.status(200).json({
      success: true,
      status: 200,
      message: "User cart is available.",
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};
/* Explanation: `getCart` reads the cart for the current request. It uses `req.cartId`, which must be set by upstream middleware (often an auth/session middleware). It builds `populateOptions` so the response includes product details (`items.productRef`) and, when a user exists, user fields too. `populate` is a Mongoose “join-like” operation: it replaces ObjectId references with the referenced documents. The `select` strings limit fields to reduce payload size and avoid leaking private data. The pattern `populateOptions.unshift(...)` adds the user population as the first populate stage when needed. If no cart is found, it throws a 404 error. Using `next(err)` ensures the global error handler returns a standardized error response. */

const addOneItemToCart = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    if (!product) throw throwNewError(404, "Product not found.");

    // const cart = await Cart.findById(req.cartId).populate(getCartPopulateOptions(req.userId));
    const cart = await Cart.findById(req.cartId);
    if (!cart) throw throwNewError(404, "Cart is empty.");

    const itemInCart = cart.items.find(
      (item) => item.productRef && item.productRef.equals(product._id),
    );

    if (product.stock > 0) {
      // 1. Atomic Stock Update
      await updateProductStock(productId, -1);
    } else {
      throw throwNewError(400, "Product out of stock.");
    }

    const discount = product.discountPercentage || 0;
    const discountedPrice = product.price - (discount / 100) * product.price;

    if (itemInCart) {
      itemInCart.unitsToBuy += 1;
      itemInCart.finalItemPrice = discountedPrice * itemInCart.unitsToBuy;
    } else {
      cart.items.unshift({
        productRef: productId,
        unitsToBuy: 1,
        priceAtAddition: product.price,
        finalItemPrice: discountedPrice,
      });
    }
    // |
    // totalPrice is handled by the pre-save hook in the model!
    // | This is a good example of separation of concerns: the controller focuses on business logic (adding items, updating stock), while the model handles derived state (totalPrice) through hooks. This keeps the controller code cleaner and ensures that totalPrice is always consistent with the items array, regardless of how items are modified.
    await cart.save();
    // Repopulate the cart so the frontend gets the full product object, not just an ID!
    await cart.populate(getCartPopulateOptions(req.userId));

    res.status(200).json({
      success: true,
      status: 200,
      message: "Item count incresssed by one in cart.",
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};
/* Explanation: `addOneItemToCart` increases quantity for a product in the cart (or inserts it if missing) and also decreases product stock. This is an example of “cross-document consistency”: you change the cart and inventory together. The code checks if the product is already in the cart; if yes, it increments `unitsToBuy` and recalculates `finalItemPrice` based on discount. If not, it unshifts a new item into the cart array (so newest item appears first).Important concurrency concept: stock updates can be contested by multiple users at the same time. The controller uses `Product.findOneAndUpdate({ _id: productId, stock: { $gt: 0 } }, { $inc: { stock: -1 } })` which is an atomic update: MongoDB performs the check and decrement in one step, preventing race conditions where two requests read the same stock and both decrement below zero. If `updated` is null, stock was not available and you throw an error. A more robust system would use database transactions for cart+stock, but atomic updates are a reasonable intermediate approach. */

const removeOneItemFromCart = async (req, res, next) => {
  try {
    // const cart = await Cart.findById(req.cartId).populate(getCartPopulateOptions(req.userId));
    const { productId } = req.body;
    const cart = await Cart.findById(req.cartId);
    if (!cart) throw throwNewError(404, "Cart is empty.");

    // const product = await Product.findById(productId);
    // if (!product) throw throwNewError(400, "Product out of stock.");

    const itemIndex = cart.items.findIndex((item) =>
      item.productRef.equals(productId),
    );
    if (itemIndex === -1) throw throwNewError(404, "Product not in cart.");

    const itemInCart = cart.items[itemIndex];
    itemInCart.unitsToBuy -= 1;
    if (itemInCart.unitsToBuy <= 0) {
      const itemInCart = cart.items[itemIndex];
      itemInCart.unitsToBuy -= 1;
      cart.items.splice(itemIndex, 1);
    }

    await cart.save();
    // 1. Atomic Stock Update
    await updateProductStock(productId, 1);

    if (cart.items.length <= 0) {
      await Cart.findByIdAndDelete(req.cartId);
      return res.status(200).json({
        success: true,
        status: 200,
        message: "Cart is now empty and has been deleted.",
        data: { items: [], totalPrice: 0, totalItems: 0 },
      });
    }

    // Repopulate!
    await cart.populate(getCartPopulateOptions(req.userId));

    res.status(200).json({
      success: true,
      status: 200,
      message: "Item count decreased by one in cart.",
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};
/* Explanation: `removeOneItemFromCart` is the inverse of add: it decrements `unitsToBuy` for an item, removes the item if quantity becomes 0, and restores product stock by incrementing it. It also deletes the entire cart document if it becomes empty. That “delete when empty” is a design choice: some apps keep empty carts, others remove them. Notice the method still restores stock even if the item gets removed. This endpoint highlights careful ordering: (1) mutate cart state, (2) save cart, (3) restore stock, (4) if cart empty, delete cart and return a response. In a perfect world, you would use a transaction so failures in later steps can’t leave inconsistent state. Without transactions, you rely on careful checks and idempotency. */

const deleteProductFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findById(req.cartId).populate(
      getCartPopulateOptions(req.userId),
    );
    if (!cart) throw throwNewError(404, "Cart is empty.");

    // const product = await Product.findById(productId);
    // if (!product) throw throwNewError(400, "Product not found.");

    const itemIndex = cart.items.findIndex((item) =>
      item.productRef.equals(productId),
    );
    if (itemIndex === -1) throw throwNewError(404, "Product not in cart.");

    const unitsToRestore = cart.items[itemIndex]?.unitsToBuy || 0;
    cart.items.splice(itemIndex, 1);

    await updateProductStock(productId, unitsToRestore);
    await cart.save();

    if (cart.items.length === 0) {
      await Cart.findByIdAndDelete(req.cartId);
      return res.status(200).json({
        success: true,
        data: { items: [], totalPrice: 0, totalItems: 0 },
      });
    }

    // Repopulate!
    await cart.populate(getCartPopulateOptions(req.userId));
    res.status(200).json({
      success: true,
      status: 200,
      message: "Product removed from cart.",
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};
/* Explanation: `deleteProductFromCart` removes a product line item entirely, regardless of quantity. Because it’s a full removal, it restores stock by the removed quantity (`unitsToRestore`). It uses `findIndex` + `splice` to remove the item, then performs `$inc` on Product stock. This is another example of maintaining consistency between cart and inventory. The function throws errors when cart is missing, product is missing, or product isn’t in cart, which protects the API from invalid requests and keeps responses meaningful. */

const deleteCart = async (req, res, next) => {
  try {
    const cart = await Cart.findByIdAndDelete(req.cartId);
    if (!cart) throw throwNewError(404, "Cart not found.");

    // Restore stock for all items in parallel
    const stockRestorations = cart.items.map((item) =>
      Product.findByIdAndUpdate(item.productRef._id, {
        $inc: { stock: item.unitsToBuy }, //unitsToRestore
      }),
    );

    await Promise.all(stockRestorations);
    await Cart.findByIdAndDelete(req.cartId);

    res.status(200).json({
      success: true,
      status: 200,
      message: "Cart is empty.",
    });
  } catch (err) {
    next(err);
  }
};
/* Explanation: `deleteCart` deletes the entire cart document and then restores stock for every product that was in the cart. It loops through `cart.items` and increments stock accordingly. This is a “cleanup” endpoint that ensures inventory isn’t permanently reduced because a cart was abandoned. A nuance: the loop performs multiple separate updates; if one update fails, some stock may be restored and some may not. In production, you might add retry logic, batching, or transactions. The response message `"Cart is empty."` is a bit misleading because the cart is deleted; but we keep behavior unchanged to avoid breaking clients. */

// const updateOneItemInCart = (req, res, next) => {}; // TODO, Not critical requirement rit now

module.exports = {
  getCart,
  addOneItemToCart,
  //   updateOneItemInCart,
  removeOneItemFromCart,
  deleteProductFromCart,
  deleteCart,
};
