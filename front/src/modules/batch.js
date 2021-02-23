import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ApiService from "../apiService";
import Moment from "react-moment";
import { Bar } from "react-chartjs-2";

import "./batch.css";
import { bold } from "chalk";
export default function Batch(props) {
  let { id } = useParams();
  const [batch, setBatch] = useState({
    batchName: "",
    Transactions: [],
  });
  const [loading, setLoading] = useState(false);
  const getData = () => {
    setLoading(true);
    ApiService()
      .getBatch(id)
      .then((response) => {
        setBatch(response.data);
        setLoading(false);
        if (
          response.data.Transactions.filter(
            (transaction) => !transaction.executedAt
          ).length
        ) {
          setTimeout(() => {
            getData();
          }, 2000);
        }
      });
  };
  useEffect(() => {
    getData();
  }, []);

  const seconds = (transaction) => {
    if (transaction.executedAt && transaction.receivedAt) {
      return (
        (new Date(transaction.executedAt) - new Date(transaction.receivedAt)) /
        1000
      );
    } else {
      return 0;
    }
  };

  return (
    <>
      {loading ? (
        <h1>Carregando ...</h1>
      ) : (
        <>
          <h1>{batch.batchName}</h1>
          <h2>Transações ordenadas pela execução</h2>
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Criado em</th>
                <th>Ordem de criação</th>
                <th>Executado pelo consumer</th>
                <th>Recebido pelo consumer em</th>
                <th>Finalizada a execução em</th>
                <th>Executado</th>
                <th>Tempo total em segundos (Execução)</th>
              </tr>
            </thead>
            <tbody>
              {batch.Transactions.map((transaction) => (
                <tr
                  id={transaction.id}
                  className={`tr${transaction.clientIndex}`}
                >
                  <td>{transaction.clientName}</td>
                  <td>
                    <Moment format="DD/MM/YYYY HH:mm:ss SS">
                      {transaction.createdAt}
                    </Moment>
                  </td>
                  <td>{transaction.order}</td>
                  <td><b>{transaction.consumerName}</b> </td>
                  <td>
                    <Moment format="DD/MM/YYYY HH:mm:ss SS">
                      {transaction.receivedAt}
                    </Moment>
                  </td>
                  <td>
                    {transaction.executedAt ? (
                      <Moment format="DD/MM/YYYY HH:mm:ss SS">
                        {transaction.executedAt}
                      </Moment>
                    ) : (
                      "Em processamento ..."
                    )}
                  </td>
                  <td>{transaction.executed ? "Sim" : "Não"}</td>
                  <td>{seconds(transaction)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}
