"use server";

import { v2 as cloudinary } from "cloudinary";
import { getAdminSession } from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "bkguitcu",
  api_key: process.env.CLOUDINARY_API_KEY || "521688581392754",
  api_secret: process.env.CLOUDINARY_API_SECRET || "MTE2uiecoE8UPC898m0Wd88mLqM",
  secure: true,
});

export async function uploadImageAction(formData: FormData) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { error: "Unauthorized" };
    }

    const file = formData.get("file") as File;
    if (!file) {
      return { error: "No file provided" };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "slipper-store-products" },
          (error, res) => {
            if (error || !res) {
              reject(error || new Error("Cloudinary upload failed"));
            } else {
              resolve({ secure_url: res.secure_url });
            }
          }
        )
        .end(buffer);
    });

    return { url: result.secure_url };
  } catch (err: any) {
    console.error("Cloudinary upload error:", err);
    return { error: err.message || "Failed to upload image to Cloudinary" };
  }
}
