import React, { useState, useEffect } from 'react';
import axios from 'axios';  
import { Table, Container, Row, Card, CardHeader, Col, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import Header from 'components/Headers/Header';

const ClientsList = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);  // Cliente selecionado para edição
  const [newClient, setNewClient] = useState({ nome_cliente: '' });

  useEffect(() => {
    axios.get('http://localhost:8000/api/clientes/')
      .then((response) => {
        setClients(response.data);
      })
      .catch((error) => {
        console.error('Erro ao buscar clientes', error);
      });
  }, []);

  // Função para cadastrar ou modificar o cliente
  const handleSaveClient = (e) => {
    e.preventDefault();

    if (selectedClient) {
      // Atualizar cliente existente
      axios.put(`http://localhost:8000/api/clientes/${selectedClient.id}/`, selectedClient)
        .then(() => {
          setClients(clients.map(client => client.id === selectedClient.id ? selectedClient : client));
          setSelectedClient(null);  // Limpa o formulário
        })
        .catch((error) => {
          console.error('Erro ao modificar cliente', error);
        });
    } else {
      // Adicionar novo cliente
      axios.post('http://localhost:8000/api/clientes/', newClient)
        .then((response) => {
          setClients([...clients, response.data]);
          setNewClient({ nome_cliente: '' });  // Limpa o formulário
        })
        .catch((error) => {
          console.error('Erro ao cadastrar cliente', error);
        });
    }
  };

  // Função para carregar dados do cliente selecionado no formulário
  const handleSelectClient = (client) => {
    setSelectedClient(client);
  };

  // Função para deletar cliente
  const handleDeleteClient = () => {
    if (selectedClient) {
      axios.delete(`http://localhost:8000/api/clientes/${selectedClient.id}/`)
        .then(() => {
          setClients(clients.filter(client => client.id !== selectedClient.id));
          setSelectedClient(null);  // Limpa o formulário
        })
        .catch((error) => {
          console.error('Erro ao deletar cliente', error);
        });
    }
  };

  // Função para limpar o formulário e voltar ao estado de cadastro
  const handleNewClient = () => {
    setSelectedClient(null);
    setNewClient({ nome_cliente: '' });
  };

  // Atualiza os valores no formulário
  const handleInputChange = (e) => {
    if (selectedClient) {
      setSelectedClient({ ...selectedClient, [e.target.name]: e.target.value });
    } else {
      setNewClient({ ...newClient, [e.target.name]: e.target.value });
    }
  };

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          {/* Coluna da lista de clientes */}
          <Col xl="8">
            <Card className="bg-default shadow">
              <CardHeader className="bg-transparent border-0">
                <h3 className="text-white mb-0">Lista de Clientes</h3>
              </CardHeader>
              <Table className="align-items-center table-dark table-flush" responsive>
                <thead className="thead-dark">
                  <tr>

                    <th>Nome do Cliente</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id} onClick={() => handleSelectClient(client)}>

                      <td>{client.nome_cliente}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </Col>

          {/* Coluna do formulário de cadastro/edição de cliente */}
          <Col xl="4" className="mb-0">
            <Card className="bg-secondary shadow">
              <CardHeader className="border-0 d-flex justify-content-between align-items-center">
                <h3 className="mb-0">{selectedClient ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}</h3>
                {selectedClient && (
                  <Button color="info" onClick={handleNewClient}>Novo Cliente</Button>
                )}
              </CardHeader>
              <Col xl="12" className="mb-4">
              <Form onSubmit={handleSaveClient}>
                <FormGroup>
                <Col xl="4" className="mb-4"> </Col>
                  <Label className="form-control-label">Nome do Cliente</Label>
                  <Input
                    type="text"
                    name="nome_cliente"
                    id="nome_cliente"
                    value={selectedClient ? selectedClient.nome_cliente : newClient.nome_cliente}
                    onChange={handleInputChange}
                    placeholder="Digite o nome do cliente"
                    required
                  />
                </FormGroup>
                
                <Button type="submit" color="primary">
                  {selectedClient ? 'Modificar' : 'Cadastrar'}
                </Button>
                {selectedClient && (
                  <Button color="danger" onClick={handleDeleteClient} className="ml-2">
                    Deletar
                  </Button>
                )}
                
              </Form>
              </Col>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ClientsList;
