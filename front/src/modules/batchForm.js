import { useState } from "react";
import ApiService from "../apiService";

export default function BatchForm(props) {
  const clearData = {
    batchName: "Batch de exemplo",
    simulations: [],
  };
  const [data, setData] = useState(clearData);

  async function handleSubmit(e) {
    e.preventDefault();
    await ApiService().createBatch(data);
    setData(clearData);
    props.callback();
  }

  function addClient(e) {
    setData({
      ...data,
      simulations: [
        ...data.simulations,
        {
          clientName: `Cliente ${data.simulations.length}`,
          transactionsCount: 100,
          initialDelay: 1000,
          proccessTime: 2000,
          percentFailure: 0,
          clientIndex: data.simulations.length,
        },
      ],
    });
    e.preventDefault();
  }

  function setClientData(index, e) {
    let items = [...data.simulations];
    let item = { ...items[index] };
    item[e.name] = e.value;
    data.simulations[index] = item;

    setData({
      ...data,
    });
  }
  return (
    <>
      <form onSubmit={handleSubmit}>
        <label>
          Nome:
          <input
            type="text"
            value={data.batchName}
            onChange={(event) =>
              setData({
                ...data,
                batchName: event.target.value,
              })
            }
          />
        </label>
        <h3>Simular transações</h3>
        <button hidden={data.simulations.length > 5} onClick={addClient}>
          Adicionar cliente
        </button>
        <table>
          <thead>
            <tr>
              <th>Nome do cliente</th>
              <th>Quantidade de transações</th>
              <th>Delay Inicial em milisegundos</th>
              <th>Percentual de falha</th>
              <th>Tempo médio de processamento em milisegundos</th>
            </tr>
          </thead>
          <tbody>
            {data.simulations.map((simulation, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    name="clientName"
                    value={simulation.clientName}
                    onChange={(event) => setClientData(index, event.target)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    max="2000"
                    name="transactionsCount"
                    value={simulation.transactionsCount}
                    onChange={(event) => setClientData(index, event.target)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    max="30000"
                    name="initialDelay"
                    value={simulation.initialDelay}
                    onChange={(event) => setClientData(index, event.target)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    name="percentFailure"
                    value={simulation.percentFailure}
                    onChange={(event) => setClientData(index, event.target)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    max="30000"
                    name="proccessTime"
                    value={simulation.proccessTime}
                    onChange={(event) => setClientData(index, event.target)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <input type="submit" value="Executar" />
      </form>
    </>
  );
}
