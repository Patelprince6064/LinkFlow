import crypto from "crypto";

const hashIp = (ipAddress) => {
  if (!ipAddress) return null;
  return crypto.createHash("sha256").update(ipAddress).digest("hex");
};

export default hashIp;
