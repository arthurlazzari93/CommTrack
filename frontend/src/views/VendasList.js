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
    desconto_consultor: '',
    data_venda: '',
    data_vigencia: '',
    data_vencimento: '',
  });
  const [clientes, setClientes] = useState([]);
  const [plano, setPlanos] = useState([]);
  const [consultor, setConsultores] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/clientes/')
      .then(response => setClientes(response.data))
      .catch(error => console.error('Erro ao buscar clientes', error));

    axios.get('http://localhost:8000/api/plano/')
      .then(response => setPlanos(response.data))
      .catch(error => console.error('Erro ao buscar planos', error));

    axios.get('http://localhost:8000/api/consultor/')
      .then(response => setConsultores(response.data))
      .catch(error => console.error('Erro ao buscar consultores', error));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:8000/api/venda/')
      .then(response => setVendas(response.data))
      .catch(error => console.error('Erro ao buscar vendas', error));
  }, []);

  const handleSaveVenda = (e) => {
    e.preventDefault();
    const vendaData = selectedVenda || newVenda;

    if (selectedVenda) {
      axios.put(`http://localhost:8000/api/venda/${selectedVenda.id}/`, vendaData)
        .then(response => {
          setVendas(vendas.map(venda => venda.id === selectedVenda.id ? response.data : venda));
          setSelectedVenda(null);
        })
        .catch(error => console.error('Erro ao modificar venda', error));
    } else {
      axios.post('http://localhost:8000/api/venda/', vendaData)
        .then(response => {
          setVendas([...vendas, response.data]);
          setNewVenda({
            cliente: '',
            plano: '',
            consultor: '',
            numero_proposta: '',
            valor_plano: '',
            desconto_consultor: '',
            data_venda: '',
            data_vigencia: '',
            data_vencimento: '',
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
      axios.delete(`http://localhost:8000/api/venda/${selectedVenda.id}/`)
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
      desconto_consultor: '',
      data_venda: '',
      data_vigencia: '',
      data_vencimento: '',
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
      map[cliente.id] = cliente.nome;
      return map;
    }, {});
  }, [clientes]);

  const planosMap = useMemo(() => {
    return plano.reduce((map, plano) => {
      map[plano.id] = `${plano.operadora} - ${plano.tipo}`;
      return map;
    }, {});
  }, [plano]);

  const consultoresMap = useMemo(() => {
    return consultor.reduce((map, consultor) => {
      map[consultor.id] = consultor.nome;
      return map;
    }, {});
  }, [consultor]);

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
                    <th>Número Proposta</th>
                    <th>Cliente</th>
                    <th>Plano</th>
                    <th>Consultor</th>
                    <th>Valor Plano</th>
                    <th>Desconto Consultor</th>
                    {/* Adicione mais colunas se necessário */}
                  </tr>
                </thead>
                <tbody>
                  {vendas.map(venda => (
                    <tr key={venda.id} onClick={() => handleSelectVenda(venda)}>
                      <td>{venda.id}</td>
                      <td>{venda.numero_proposta}</td>
                      <td>{clientesMap[venda.cliente] || venda.cliente}</td>
                      <td>{planosMap[venda.plano] || venda.plano}</td>
                      <td>{consultoresMap[venda.consultor] || venda.consultor}</td>
                      <td>{venda.valor_plano}</td>
                      <td>{venda.desconto_consultor}</td>
                      {/* Exiba o valor líquido se ele estiver disponível na API */}
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
                    {clientes.map(cliente => <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>)}
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label for="plano">Plano</Label>
                  <Input type="select" name="plano" id="plano" value={selectedVenda ? selectedVenda.plano : newVenda.plano} onChange={handleInputChange} required>
                    <option value="">Selecione o plano</option>
                    {plano.map(plano => <option key={plano.id} value={plano.id}>{plano.operadora} - {plano.tipo}</option>)}
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label for="consultor">Consultor</Label>
                  <Input type="select" name="consultor" id="consultor" value={selectedVenda ? selectedVenda.consultor : newVenda.consultor} onChange={handleInputChange} required>
                    <option value="">Selecione o consultor</option>
                    {consultor.map(consultor => <option key={consultor.id} value={consultor.id}>{consultor.nome}</option>)}
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
                  <Label for="desconto_consultor">Desconto do Consultor</Label>
                  <Input type="number" name="desconto_consultor" id="desconto_consultor" value={selectedVenda ? selectedVenda.desconto_consultor : newVenda.desconto_consultor} onChange={handleInputChange} />
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
