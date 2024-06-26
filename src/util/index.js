export const convertBytes = (bytes, decimals) => {
    const K_UNIT = 1024;
    const SIZES = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
  
    if (bytes == 0) return "0 Byte";
  
    let i = Math.floor(Math.log(bytes) / Math.log(K_UNIT));
    let resp =
      parseFloat((bytes / Math.pow(K_UNIT, i)).toFixed(decimals)) +
      " " +
      SIZES[i];
  
    return resp;
};
  
export const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString();
};

export const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};