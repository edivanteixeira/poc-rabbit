import ApiService from "../apiService";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BatchForm from "./batchForm";

export default function Home(props) {
  const [batchs, setBatchs] = useState([]);
  const getData =()=>{
    ApiService()
    .getAllBatchs()
    .then((response) => setBatchs(response.data));
  };
  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <h1>Batchs</h1>
      <BatchForm callback={()=>getData()} />
      <ul>
        {batchs.map((batch) => (
          <li key={batch.id}>
            <Link to={`/batch/${batch.id}/`}>{batch.batchName}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
