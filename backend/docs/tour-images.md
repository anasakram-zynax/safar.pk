# Tour image setup and manual verification

Tour images are uploaded through the authenticated NestJS API. The browser never receives a Cloudinary API secret. New images are placed in `safar-pk/tours` and their secure URL and public ID are stored in `TourImage`.

## Cloudinary account and environment

1. Create or sign in to a Cloudinary account at [cloudinary.com](https://cloudinary.com/). Select the product environment to use for Safar.pk.
2. Copy its **Cloud name** from the Console Dashboard. In **Settings → API Keys**, copy an active API key and its API secret.
3. Put `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in `backend/.env`. Keep that file private. Never put the key or secret in a `NEXT_PUBLIC_*` variable.
4. Put only the same cloud name in `frontend/.env.local` as `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`. Keep `NEXT_PUBLIC_API_URL` pointed to your backend API base, for example `http://localhost:4000/api`.
5. For each database environment, run `npx prisma migrate deploy` from `backend/` before starting the updated backend. Restart backend and frontend after changing environment values.

The migration adds nullable `TourImage.publicId`. Existing URL-only rows remain in the database and public GET responses. New image writes use the file endpoint; create and update tour DTOs no longer accept an `images` array.

## Endpoints

All paths below include the existing `/api` prefix and require an **ADMIN** Bearer token for writes.

| Action | Request | Result |
| --- | --- | --- |
| Add image | `POST /api/tours/:id/images`, `multipart/form-data` with file field `image` and optional text field `altText` | Created image row in the existing response envelope |
| Remove image | `DELETE /api/tours/:tourId/images/:imageId` | Removed image ID in the existing response envelope |
| Read published tour | `GET /api/tours/:slug` | `images[]` ordered by `sortOrder` ascending |

JPEG, PNG, and WebP are accepted up to **5 MiB**. MIME type and file signatures are checked. A missing or invalid file returns 400; Multer rejects oversized uploads before service processing. An image ID must belong to the tour ID in its delete path.

## Manual test sequence

Use Postman, Bruno, or an equivalent API client. Authenticate as an existing ADMIN through `POST /api/auth/login`; use the returned `data.accessToken` as a Bearer token. Select a real existing tour ID from `GET /api/tours`.

1. Send a relevant JPEG, PNG, or WebP as the `image` file field to the add-image endpoint. Optionally set `altText`. Check for an HTTPS `res.cloudinary.com` URL, `publicId`, and the next `sortOrder` in the returned row. Check the asset in Cloudinary under `safar-pk/tours`.
2. Read that tour by slug. Confirm the new row is in `images[]` in ascending `sortOrder`. Confirm the frontend TourCard renders the image after setting the public cloud name.
3. Repeat the upload with no token (expect 401) and a CUSTOMER token (expect 403). Try a text file (expect 400) and a file larger than 5 MiB (expect rejection, normally 413).
4. Delete the image using its returned ID. Confirm the row is gone from the tour response and the Cloudinary asset is gone. A wrong tour ID should return 404 without deleting the image.
5. For a disposable tour with its own uploaded image, delete the tour and confirm its Cloudinary asset is removed. Do not use a seeded tour you want to keep.
6. Confirm a tour with no images still shows the frontend mountain illustration.

If Cloudinary deletion fails unexpectedly, the API leaves the database row or tour in place and returns an error. If an upload reaches Cloudinary but the database insert fails, the API attempts to delete that new asset. Cloudinary deletion can succeed before a later database deletion fails; retrying the delete treats an already-missing Cloudinary asset as cleaned up.

## Upload timeouts

The backend gives Cloudinary's upload request 120 seconds and logs the elapsed time when it fails. Restart the backend after updating this setting. A `499 TimeoutError` comes from the Cloudinary SDK's upload request; the 502 response is how this API reports that storage failure. If it still fails after roughly six seconds, check whether a VPN, proxy, firewall, or security product is interrupting the upload connection. A successful Cloudinary API ping verifies credentials and basic connectivity but does not prove that multipart uploads can complete. Try a small JPEG file in Postman with the `image` field set to **File** and let Postman set the multipart `Content-Type` boundary automatically. If the upload still fails, retain the elapsed-time log and compare behavior from another network.
