export function isAllowedCloudinaryImage(
  value: string | undefined,
): value is string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!value || !cloudName || !/^[a-zA-Z0-9_-]+$/.test(cloudName)) return false;

  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "res.cloudinary.com" &&
      url.port === "" &&
      url.username === "" &&
      url.password === "" &&
      url.pathname.startsWith(`/${cloudName}/image/upload/`) &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
}
