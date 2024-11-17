// src/views/VendasList.js

import React, { useState, useEffect } from 'react';
import api from '../api';
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
  Alert
} from 'reactstrap';
import Header from 'components/Headers/Header';

const VendasList = () => {
  const [vendas, setVendas] = useState([]);
  const [selectedVenda, setSelectedVenda] = useState(null);
  const [newVenda, setNewVenda] = useState({
    cliente_id: '',
    plano_id: '',
    consultor_id: '',
    numero_proposta: '',
    valor_plano: '',
    desconto_consultor: '',
    data_venda: '',
    data_vigencia: '',
    data_vencimento: '',
  });
  const [clientes, setClientes] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [consultores, setConsultores] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Função para buscar todos os dados necessários
    const fetchData = async () => {
      try {
        const [clientesResponse, planosResponse, consultoresResponse, vendasResponse] = await Promise.all([
          api.get('api/clientes/'),
          api.get('api/plano/'),
          api.get('api/consultor/'),
          api.get('api/venda/')
        ]);

        setClientes(clientesResponse.data);
        setPlanos(planosResponse.data);
        setConsultores(consultoresResponse.data);
        setVendas(vendasResponse.data);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError('Erro ao buscar dados. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Função para cadastrar ou modificar a venda
  const handleSaveVenda = async (e) => {
    e.preventDefault();
    const vendaData = selectedVenda ? selectedVenda : newVenda;

    try {
      if (selectedVenda) {
        // Atualizar venda existente
        const response = await api.put(`api/venda/${selectedVenda.id}/`, vendaData);
        setVendas(vendas.map(venda => venda.id === selectedVenda.id ? response.data : venda));
        setSelectedVenda(null);
      } else {
        // Adicionar nova venda
        const response = await api.post('api/venda/', vendaData);
        setVendas([...vendas, response.data]);
        setNewVenda({
          cliente_id: '',
          plano_id: '',
          consultor_id: '',
          numero_proposta: '',
          valor_plano: '',
          desconto_consultor: '',
          data_venda: '',
          data_vigencia: '',
          data_vencimento: '',
        });
      }
      setError(null);
    } catch (err) {
      console.error('Erro ao salvar venda:', err.response);
      setError(`Erro ao salvar venda: ${JSON.stringify(err.response?.data)}`);
    }
  };

  // Função para selecionar uma venda para edição
  const handleSelectVenda = (venda) => {
    setSelectedVenda({
      ...venda,
      cliente_id: venda.cliente.id,
      plano_id: venda.plano.id,
      consultor_id: venda.consultor.id,
    });
    setError(null);
  };

  // Função para deletar uma venda
  const handleDeleteVenda = async () => {
    if (selectedVenda) {
      try {
        await api.delete(`api/venda/${selectedVenda.id}/`);
        setVendas(vendas.filter(venda => venda.id !== selectedVenda.id));
        setSelectedVenda(null);
        setError(null);
      } catch (err) {
        console.error('Erro ao deletar venda:', err);
        setError('Erro ao deletar venda. Tente novamente mais tarde.');
      }
    }
  };

  // Função para iniciar uma nova venda
  const handleNewVenda = () => {
    setSelectedVenda(null);
    setNewVenda({
      cliente_id: '',
      plano_id: '',
      consultor_id: '',
      numero_proposta: '',
      valor_plano: '',
      desconto_consultor: '',
      data_venda: '',
      data_vigencia: '',
      data_vencimento: '',
    });
    setError(null);
  };

  // Função para atualizar os valores do formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;

    // Converter campos numéricos para números
    if (['valor_plano', 'desconto_consultor'].includes(name)) {
      parsedValue = value ? parseFloat(value) : '';
    }

    // Converter IDs para inteiros
    if (['cliente_id', 'plano_id', 'consultor_id'].includes(name)) {
      parsedValue = value ? parseInt(value, 10) : '';
    }

    if (selectedVenda) {
      setSelectedVenda({ ...selectedVenda, [name]: parsedValue });
    } else {
      setNewVenda({ ...newVenda, [name]: parsedValue });
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
            <p className="text-center mt-3">Carregando vendas...</p>
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
          {/* Coluna da lista de vendas */}
          <Col xl="8">
            <Card className="bg-default shadow">
              <CardHeader className="bg-transparent border-0">
                <h3 className="text-white mb-0">Lista de Vendas</h3>
              </CardHeader>
              <Table className="align-items-center table-dark table-flush" responsive hover>
                <thead className="thead-dark">
                  <tr>
                    <th>Ações</th>
                    <th>ID</th>
                    <th>Número Proposta</th>
                    <th>Cliente</th>
                    <th>Plano</th>
                    <th>Consultor</th>
                    <th>Valor Plano</th>
                    <th>Desconto Consultor</th>
                    <th>Data Venda</th>
                    <th>Data Vigência</th>
                    <th>Data Vencimento</th>
                  </tr>
                </thead>
                <tbody>
                  {vendas.length > 0 ? (
                    vendas.map(venda => (
                      <tr key={venda.id} style={{ cursor: 'pointer' }}>
                        <td>
                          <Button 
                            color="info" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              handleSelectVenda(venda); 
                            }} 
                            size="sm"
                          >
                            Modificar
                          </Button>
                        </td>
                        <td>{venda.id}</td>
                        <td>{venda.numero_proposta}</td>
                        <td>{venda.cliente.nome}</td>
                        <td>{venda.plano.operadora} - {venda.plano.tipo}</td>
                        <td>{venda.consultor.nome}</td>
                        <td>{venda.valor_plano}</td>
                        <td>{venda.desconto_consultor}</td>
                        <td>{venda.data_venda}</td>
                        <td>{venda.data_vigencia}</td>
                        <td>{venda.data_vencimento}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="11" className="text-center">
                        Nenhuma venda encontrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card>
          </Col>

          {/* Coluna do formulário de cadastro/edição de venda */}
          <Col xl="4" className="mb-0">
            <Card className="bg-secondary shadow">
              <CardHeader className="border-0 d-flex justify-content-between align-items-center">
                <h3 className="mb-0">
                  {selectedVenda ? 'Editar Venda' : 'Cadastrar Nova Venda'}
                </h3>
                {selectedVenda && (
                  <Button color="info" onClick={handleNewVenda}>
                    Nova Venda
                  </Button>
                )}
              </CardHeader>
              <Form onSubmit={handleSaveVenda} className="p-3">
                {/* Formulário de entrada de dados */}
                <FormGroup>
                  <Label for="cliente_id">Cliente</Label>
                  <Input
                    type="select"
                    name="cliente_id"
                    id="cliente_id"
                    value={selectedVenda ? selectedVenda.cliente_id : newVenda.cliente_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione o cliente</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                    ))}
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label for="plano_id">Plano</Label>
                  <Input
                    type="select"
                    name="plano_id"
                    id="plano_id"
                    value={selectedVenda ? selectedVenda.plano_id : newVenda.plano_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione o plano</option>
                    {planos.map(plano => (
                      <option key={plano.id} value={plano.id}>{plano.operadora} - {plano.tipo}</option>
                    ))}
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label for="consultor_id">Consultor</Label>
                  <Input
                    type="select"
                    name="consultor_id"
                    id="consultor_id"
                    value={selectedVenda ? selectedVenda.consultor_id : newVenda.consultor_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione o consultor</option>
                    {consultores.map(consultor => (
                      <option key={consultor.id} value={consultor.id}>{consultor.nome}</option>
                    ))}
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label for="numero_proposta">Número da Proposta</Label>
                  <Input 
                    type="text" 
                    name="numero_proposta" 
                    id="numero_proposta" 
                    value={selectedVenda ? selectedVenda.numero_proposta : newVenda.numero_proposta} 
                    onChange={handleInputChange} 
                    placeholder="Digite o número da proposta" 
                    required 
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="valor_plano">Valor do Plano</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    name="valor_plano" 
                    id="valor_plano" 
                    value={selectedVenda ? selectedVenda.valor_plano : newVenda.valor_plano} 
                    onChange={handleInputChange} 
                    placeholder="Digite o valor do plano" 
                    required 
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="desconto_consultor">Desconto do Consultor</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    name="desconto_consultor" 
                    id="desconto_consultor" 
                    value={selectedVenda ? selectedVenda.desconto_consultor : newVenda.desconto_consultor} 
                    onChange={handleInputChange} 
                    placeholder="Digite o desconto do consultor" 
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="data_venda">Data da Venda</Label>
                  <Input 
                    type="date" 
                    name="data_venda" 
                    id="data_venda" 
                    value={selectedVenda ? selectedVenda.data_venda : newVenda.data_venda} 
                    onChange={handleInputChange} 
                    required 
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="data_vigencia">Data de Vigência</Label>
                  <Input 
                    type="date" 
                    name="data_vigencia" 
                    id="data_vigencia" 
                    value={selectedVenda ? selectedVenda.data_vigencia : newVenda.data_vigencia} 
                    onChange={handleInputChange} 
                    required 
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="data_vencimento">Data de Vencimento</Label>
                  <Input 
                    type="date" 
                    name="data_vencimento" 
                    id="data_vencimento" 
                    value={selectedVenda ? selectedVenda.data_vencimento : newVenda.data_vencimento} 
                    onChange={handleInputChange} 
                    required 
                  />
                </FormGroup>

                <Button type="submit" color="primary">
                  {selectedVenda ? 'Modificar' : 'Cadastrar'}
                </Button>
                {selectedVenda && (
                  <Button 
                    color="danger" 
                    className="ml-2" 
                    onClick={handleDeleteVenda}
                  >
                    Deletar
                  </Button>
                )}
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default VendasList;
