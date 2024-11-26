const express = require("express");
const { isSeller, isAuthenticated, isAdmin } = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const router = express.Router();
const Product = require("../model/product");
const Order = require("../model/order");
const Shop = require("../model/shop");
const { upload } = require("../multer");
const ErrorHandler = require("../utils/ErrorHandler");
const fs = require("fs");

// create product
router.post(
  "/create-product",
  upload.array("images"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      console.log(123);
      const shopId = req.body.shopId;
      const shop = await Shop.findByPk(shopId);

      if (!shop) {
        return next(new ErrorHandler("Id cửa hàng không hợp lệ!", 400));
      } else {
        const files = req.files;
        const imageUrls = files.map((file) => `${file.filename}`);
        const productData = req.body;
        productData.images = imageUrls;
        productData.shop = shop;
        productData.discount_price = 0;
        productData.shop_id = shopId;
        const product = await Product.create(productData);
        res.status(201).json({
          success: true,
          product,
        });
      }
    } catch (error) {
      return res.json({
        message: error.message,
      });
    }
  })
);

// get all products of a shop
router.get(
  "/get-all-products-shop/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const products = await Product.findAll({
        where: { shop_id: req.params.id },
      });

      res.status(201).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// delete product of a shop
router.delete(
  "/delete-shop-product/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const productId = req.params.id;

      const productData = await Product.findByPk(productId);
      const imageArr = JSON.parse(productData.images)
      imageArr.forEach((imageUrl) => {
        const filename = imageUrl;
        const filePath = `uploads/${filename}`;

        fs.unlink(filePath, (err) => {
          if (err) {
            console.log(err);
          }
        });
      });
      const product = await productData.destroy();
      if (!product) {
        return next(
          new ErrorHandler("Không tìm thấy sản phẩm với ID này!", 500)
        );
      }
      res.status(201).json({
        success: true,
        message: "Xóa sản phẩm thành công!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// get all products
router.get(
  "/get-all-products",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const products = await Product.findAll({})

      res.status(201).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// review for a product
router.put(
  "/create-new-review",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { user, rating, comment, productId, orderId } = req.body;

      // Tìm sản phẩm
      const product = await Product.findByPk(productId);

      // Nếu không tìm thấy sản phẩm, trả về lỗi
      if (!product) {
        return next(new ErrorHandler("Sản phẩm không tồn tại!", 404));
      }

      const review = {
        user,
        rating,
        comment,
        productId,
      };

      const dataReview = product?.reviews ? JSON.parse(product.reviews) : [];
      const isReviewed = dataReview.find((rev) => rev.user.id === req.user.id);

      if (isReviewed) {
        dataReview.forEach((rev) => {
          if (rev.user.id === req.user.id) {
            rev.rating = rating;
            rev.comment = comment;
            rev.user = user;
          }
        });
      } else {
        dataReview.push(review);
      }

      let avg = 0;
      dataReview.forEach((rev) => {
        avg += rev.rating;
      });

      product.ratings = avg / dataReview.length;
      product.reviews = dataReview
      await product.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        message: "Đánh giá thành công!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);


// all products --- for admin
router.get(
  "/admin-all-products",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const products = await Product.findAll({})
      res.status(201).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);
module.exports = router;
