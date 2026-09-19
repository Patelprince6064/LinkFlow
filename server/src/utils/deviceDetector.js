const detectDeviceType = (userAgent) => {
  if (!userAgent) return "Desktop";

  const ua = userAgent.toLowerCase();

  if (
    /tablet|ipad|playbook|silk|(android(?!.*mobi))/i.test(ua)
  ) {
    return "Tablet";
  }

  if (
    /mobile|iphone|ipod|android.*mobi|blackberry|opera mini|iemobile/i.test(ua)
  ) {
    return "Mobile";
  }

  return "Desktop";
};

export default detectDeviceType;
