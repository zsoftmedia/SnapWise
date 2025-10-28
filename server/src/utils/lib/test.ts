import { sbAdmin } from "./supabse";

(async () => {
  const { data, error } = await sbAdmin.storage.listBuckets();
  console.log("Buckets:", data);
  console.log("Error:", error);
})();