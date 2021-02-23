import axios from "axios";
function ApiService() {
  return {
    async getAllBatchs() {
      return await axios.get("http://localhost:5000/batch");
    },
    async createBatch(data) {
      await axios.post("http://localhost:5000/batch", data);
    },
    async getBatch(id){
      return await axios.get(`http://localhost:5000/batch/${id}`);
    }
  };
}
export default ApiService;
