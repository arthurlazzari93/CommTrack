import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Table, Container, Row, Card, CardHeader, Col, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import Header from 'components/Headers/Header';

const VendasList = () => {
  const [vendas, setVendas] = useState([]);
  const [selectedVenda, setSelectedVenda] = useState(null);
  const [newVenda, setNewVenda] = useState({
    cliente: '',
    plano: '',
    consultor: '',
    numero_proposta: '',
    valor_plano: '',
    data_venda: '',
    data_vigencia: '',
    data_vencimento: '',
    desconto: '',
    taxa: '',
    valor_real: ''
  });
  const [clientes, setClientes] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [consultores, setConsultores] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/clientes/')
      .then(response => setClientes(response.data))
      .catch(error => console.error('Erro ao buscar clientes', error));

    axios.get('http://localhost:8000/api/planos/')
      .then(response => setPlanos(response.data))
      .catch(error => console.error('Erro ao buscar planos', error));

    axios.get('http://localhost:8000/api/consultores/')
      .then(response => setConsultores(response.data))
      .catch(error => console.error('Erro ao buscar consultores', error));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:8000/api/vendas/')
      .then(response => setVendas(response.data))
      .catch(error => console.error('Erro ao buscar vendas', error));
  }, []);

  const handleSaveVenda = (e) => {
    e.preventDefault();
    const vendaData = selectedVenda || newVenda;

    if (selectedVenda) {
      axios.put(`http://localhost:8000/api/vendas/${selectedVenda.id}/`, vendaData)
        .then(() => {
          setVendas(vendas.map(venda => venda.id === selectedVenda.id ? vendaData : venda));
          setSelectedVenda(null);
        })
        .catch(error => console.error('Erro ao modificar venda', error));
    } else {
      axios.post('http://localhost:8000/api/vendas/', vendaData)
        .then(response => {
          setVendas([...vendas, response.data]);
          setNewVenda({
            cliente: '',
            plano: '',
            consultor: '',
            numero_proposta: '',
            valor_plano: '',
            data_venda: '',
            data_vigencia: '',
            data_vencimento: '',
            desconto: '',
            taxa: '',
            valor_real: ''
          });
        })
        .catch(error => console.error('Erro ao cadastrar venda', error));
    }
  };

  const handleSelectVenda = (venda) => {
    setSelectedVenda(venda);
  };

  const handleDeleteVenda = () => {
    if (selectedVenda) {
      axios.delete(`http://localhost:8000/api/vendas/${selectedVenda.id}/`)
        .then(() => {
          setVendas(vendas.filter(venda => venda.id !== selectedVenda.id));
          setSelectedVenda(null);
        })
        .catch(error => console.error('Erro ao deletar venda', error));
    }
  };

  const handleNewVenda = () => {
    setSelectedVenda(null);
    setNewVenda({
      cliente: '',
      plano: '',
      consultor: '',
      numero_proposta: '',
      valor_plano: '',
      data_venda: '',
      data_vigencia: '',
      data_vencimento: '',
      desconto: '',
      taxa: '',
      valor_real: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (selectedVenda) {
      setSelectedVenda({ ...selectedVenda, [name]: value });
    } else {
      setNewVenda({ ...newVenda, [name]: value });
    }
  };

  // Criar mapas para acessos rápidos
  const clientesMap = useMemo(() => {
    return clientes.reduce((map, cliente) => {
      map[cliente.id] = cliente.nome_cliente;
      return map;
    }, {});
  }, [clientes]);

  const planosMap = useMemo(() => {
    return planos.reduce((map, plano) => {
      map[plano.id] = plano.nome_plano;
      return map;
    }, {});
  }, [planos]);

  const consultoresMap = useMemo(() => {
    return consultores.reduce((map, consultor) => {
      map[consultor.id] = consultor.nome_consultor;
      return map;
    }, {});
  }, [consultores]);

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          {/* Coluna da lista de vendas */}
          <Col xl="8">
            <Card className="bg-default shadow">
              <CardHeader className="bg-transparent border-0">
                <h3 className="text-white mb-0">Lista de Vendas</h3>
              </CardHeader>
              <Table className="align-items-center table-dark table-flush" responsive>
                <thead className="thead-dark">
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Plano</th>
                    <th>Consultor</th>
                    <th>Valor Real</th>
                  </tr>
                </thead>
                <tbody>
                  {vendas.map(venda => (
                    <tr key={venda.id} onClick={() => handleSelectVenda(venda)}>
                      <td>{venda.id}</td>
                      <td>{clientesMap[venda.cliente] || venda.cliente}</td>
                      <td>{planosMap[venda.plano] || venda.plano}</td>
                      <td>{consultoresMap[venda.consultor] || venda.consultor}</td>
                      <td>{venda.valor_real}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </Col>

          {/* Coluna do formulário de cadastro/edição de venda */}
          <Col xl="4" className="mb-0">
            <Card className="bg-secondary shadow">
              <CardHeader className="border-0 d-flex justify-content-between align-items-center">
                <h3 className="mb-0">{selectedVenda ? 'Editar Venda' : 'Cadastrar Nova Venda'}</h3>
                {selectedVenda && (
                  <Button color="info" onClick={handleNewVenda}>Nova Venda</Button>
                )}
              </CardHeader>
              <Form onSubmit={handleSaveVenda} className="p-3">
                {/* Formulário de entrada de dados */}
                <FormGroup>
                  <Label for="cliente">Cliente</Label>
                  <Input type="select" name="cliente" id="cliente" value={selectedVenda ? selectedVenda.cliente : newVenda.cliente} onChange={handleInputChange} required>
                    <option value="">Selecione o cliente</option>
                    {clientes.map(cliente => <option key={cliente.id} value={cliente.id}>{cliente.nome_cliente}</option>)}
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label for="plano">Plano</Label>
                  <Input type="select" name="plano" id="plano" value={selectedVenda ? selectedVenda.plano : newVenda.plano} onChange={handleInputChange} required>
                    <option value="">Selecione o plano</option>
                    {planos.map(plano => <option key={plano.id} value={plano.id}>{plano.nome_plano}</option>)}
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label for="consultor">Consultor</Label>
                  <Input type="select" name="consultor" id="consultor" value={selectedVenda ? selectedVenda.consultor : newVenda.consultor} onChange={handleInputChange} required>
                    <option value="">Selecione o consultor</option>
                    {consultores.map(consultor => <option key={consultor.id} value={consultor.id}>{consultor.nome_consultor}</option>)}
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label for="numero_proposta">Número da Proposta</Label>
                  <Input type="text" name="numero_proposta" id="numero_proposta" value={selectedVenda ? selectedVenda.numero_proposta : newVenda.numero_proposta} onChange={handleInputChange} required />
                </FormGroup>
                <FormGroup>
                  <Label for="valor_plano">Valor do Plano</Label>
                  <Input type="number" name="valor_plano" id="valor_plano" value={selectedVenda ? selectedVenda.valor_plano : newVenda.valor_plano} onChange={handleInputChange} required />
                </FormGroup>
                <FormGroup>
                  <Label for="data_venda">Data da Venda</Label>
                  <Input type="date" name="data_venda" id="data_venda" value={selectedVenda ? selectedVenda.data_venda : newVenda.data_venda} onChange={handleInputChange} required />
                </FormGroup>
                <FormGroup>
                  <Label for="data_vigencia">Data de Vigência</Label>
                  <Input type="date" name="data_vigencia" id="data_vigencia" value={selectedVenda ? selectedVenda.data_vigencia : newVenda.data_vigencia} onChange={handleInputChange} required />
                </FormGroup>
                <FormGroup>
                  <Label for="data_vencimento">Data de Vencimento</Label>
                  <Input type="date" name="data_vencimento" id="data_vencimento" value={selectedVenda ? selectedVenda.data_vencimento : newVenda.data_vencimento} onChange={handleInputChange} required />
                </FormGroup>
                <FormGroup>
                  <Label for="desconto">Desconto</Label>
                  <Input type="number" name="desconto" id="desconto" value={selectedVenda ? selectedVenda.desconto : newVenda.desconto} onChange={handleInputChange} />
                </FormGroup>
                <FormGroup>
                  <Label for="taxa">Taxa</Label>
                  <Input type="number" name="taxa" id="taxa" value={selectedVenda ? selectedVenda.taxa : newVenda.taxa} onChange={handleInputChange} />
                </FormGroup>
                <FormGroup>
                  <Label for="valor_real">Valor Real</Label>
                  <Input type="number" name="valor_real" id="valor_real" value={selectedVenda ? selectedVenda.valor_real : newVenda.valor_real} onChange={handleInputChange} required />
                </FormGroup>
                
                <Button type="submit" color="primary">
                  {selectedVenda ? 'Modificar' : 'Cadastrar'}
                </Button>
                {selectedVenda && (
                  <Button color="danger" className="ml-2" onClick={handleDeleteVenda}>Deletar</Button>
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
