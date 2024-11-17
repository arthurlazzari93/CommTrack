// src/views/ClientsList.js

import React, { useState, useEffect } from 'react';
import api from '../api'; // Substitua 'axios' por 'api'
import {
  Table,
  Container,
  Row,
  Card,
  CardHeader,
  Col,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Spinner,
  Alert,
} from 'reactstrap';
import Header from 'components/Headers/Header';

const ClientsList = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null); // Cliente selecionado para edição
  const [newClient, setNewClient] = useState({
    nome: '',       // Corrigido de 'neme' para 'nome'
    telefone: '',
    email: '',
  });
  const [loading, setLoading] = useState(true); // Estado de carregamento
  const [error, setError] = useState(null);     // Estado de erro

  useEffect(() => {
    // Função para buscar clientes
    const fetchClients = async () => {
      try {
        const response = await api.get('api/clientes/'); // Utiliza a instância 'api'
        setClients(response.data);
      } catch (err) {
        console.error('Erro ao buscar clientes:', err);
        setError('Erro ao buscar clientes. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Função para cadastrar ou modificar o cliente
  const handleSaveClient = async (e) => {
    e.preventDefault();

    try {
      if (selectedClient) {
        // Atualizar cliente existente
        await api.put(`api/clientes/${selectedClient.id}/`, selectedClient);
        setClients(
          clients.map((client) =>
            client.id === selectedClient.id ? selectedClient : client
          )
        );
        setSelectedClient(null); // Limpa o formulário
      } else {
        // Adicionar novo cliente
        const response = await api.post('api/clientes/', newClient);
        setClients([...clients, response.data]);
        setNewClient({ nome: '', telefone: '', email: '' }); // Limpa o formulário
      }
      setError(null); // Limpa erros após operação bem-sucedida
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
      setError('Erro ao salvar cliente. Verifique os dados e tente novamente.');
    }
  };

  // Função para carregar dados do cliente selecionado no formulário
  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setError(null); // Limpa erros ao selecionar um cliente
  };

  // Função para deletar cliente
  const handleDeleteClient = async () => {
    if (selectedClient) {
      try {
        await api.delete(`api/clientes/${selectedClient.id}/`);
        setClients(clients.filter((client) => client.id !== selectedClient.id));
        setSelectedClient(null); // Limpa o formulário
        setError(null); // Limpa erros após deleção
      } catch (err) {
        console.error('Erro ao deletar cliente:', err);
        setError('Erro ao deletar cliente. Tente novamente mais tarde.');
      }
    }
  };

  // Função para limpar o formulário e voltar ao estado de cadastro
  const handleNewClient = () => {
    setSelectedClient(null);
    setNewClient({
      nome: '',
      telefone: '',
      email: '',
    });
    setError(null); // Limpa erros ao iniciar novo cadastro
  };

  // Atualiza os valores no formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (selectedClient) {
      setSelectedClient({ ...selectedClient, [name]: value });
    } else {
      setNewClient({ ...newClient, [name]: value });
    }
  };

  // Renderização Condicional de Carregamento e Erro
  if (loading) {
    return (
      <>
        <Header />
        <Container className="mt--7" fluid>
          <Row className="justify-content-center">
            <Spinner color="primary" />
            <p className="text-center mt-3">Carregando clientes...</p>
          </Row>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        {error && (
          <Row>
            <Col>
              <Alert color="danger">{error}</Alert>
            </Col>
          </Row>
        )}
        <Row>
          {/* Coluna do formulário de cadastro/edição de cliente */}
          <Col>
            <Card className="bg-secondary shadow mb-4">
              <CardHeader className="border-0 d-flex justify-content-between align-items-center">
                <h3 className="mb-0">
                  {selectedClient ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
                </h3>
                {selectedClient && (
                  <Button color="info" onClick={handleNewClient}>
                    Novo Cliente
                  </Button>
                )}
              </CardHeader>
              <Form onSubmit={handleSaveClient} className="p-3">
                <Row>
                  <Col md="4">
                    <FormGroup>
                      <Label className="form-control-label">Nome do Cliente</Label>
                      <Input
                        type="text"
                        name="nome"
                        id="nome"
                        value={selectedClient ? selectedClient.nome : newClient.nome}
                        onChange={handleInputChange}
                        placeholder="Digite o nome do cliente"
                        required
                      />
                    </FormGroup>
                  </Col>
                  <Col md="4">
                    <FormGroup>
                      <Label className="form-control-label">Telefone</Label>
                      <Input
                        type="text" // Alterado para 'text' para permitir caracteres como parênteses e hífens
                        name="telefone"
                        id="telefone"
                        value={
                          selectedClient ? selectedClient.telefone : newClient.telefone
                        }
                        onChange={handleInputChange}
                        placeholder="(11) 90909-0000"
                        required
                      />
                    </FormGroup>
                  </Col>
                  <Col md="4">
                    <FormGroup>
                      <Label className="form-control-label">E-mail</Label>
                      <Input
                        type="email" // Alterado para 'email' para validação automática
                        name="email"
                        id="email"
                        value={
                          selectedClient ? selectedClient.email : newClient.email
                        }
                        onChange={handleInputChange}
                        placeholder="exemplo@sistema.com.br"
                        required
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Button type="submit" color="primary">
                  {selectedClient ? 'Modificar' : 'Cadastrar'}
                </Button>
                {selectedClient && (
                  <Button
                    color="danger"
                    onClick={handleDeleteClient}
                    className="ml-2"
                  >
                    Deletar
                  </Button>
                )}
              </Form>
            </Card>
          </Col>
        </Row>
        <Row>
          {/* Coluna da lista de clientes */}
          <Col>
            <Card className="bg-default shadow">
              <CardHeader className="bg-transparent border-0">
                <h3 className="text-white mb-0">Lista de Clientes</h3>
              </CardHeader>
              <Table
                className="align-items-center table-dark table-flush"
                responsive
                hover
              >
                <thead className="thead-dark">
                  <tr>
                    <th>Nome do Cliente</th>
                    <th>Telefone</th>
                    <th>E-mail</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.length > 0 ? (
                    clients.map((client) => (
                      <tr
                        key={client.id}
                        onClick={() => handleSelectClient(client)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>{client.nome}</td>
                        <td>{client.telefone}</td>
                        <td>{client.email}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center">
                        Nenhum cliente encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ClientsList;
