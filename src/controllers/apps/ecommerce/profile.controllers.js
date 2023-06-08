import { EcomOrder } from "../../../models/apps/ecommerce/order.models.js";
import { EcomProfile } from "../../../models/apps/ecommerce/profile.models.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

const getMyEcomProfile = asyncHandler(async (req, res) => {
  let profile = await EcomProfile.findOne({
    owner: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, profile, "User profile fetched successfully"));
});

const updateEcomProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phoneNumber, countryCode } = req.body;
  const profile = await EcomProfile.findOneAndUpdate(
    {
      owner: req.user._id,
    },
    {
      $set: {
        firstName,
        lastName,
        phoneNumber,
        countryCode,
      },
    },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, profile, "User profile updated successfully"));
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await EcomOrder.aggregate([
    {
      // Get orders associated with the user
      $match: {
        customer: req.user._id,
      },
    },
    {
      $lookup: {
        from: "addresses",
        localField: "address",
        foreignField: "_id",
        as: "address",
      },
    },
    // lookup for a customer associated with the order
    {
      $lookup: {
        from: "users",
        localField: "customer",
        foreignField: "_id",
        as: "customer",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        customer: { $first: "$customer" },
        address: { $first: "$address" },
        totalOrderItems: { $size: "$items" },
      },
    },
    {
      $project: {
        items: 0,
      },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, { orders }, "Orders fetched successfully"));
});

export { getMyEcomProfile, updateEcomProfile, getMyOrders };
