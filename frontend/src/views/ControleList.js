import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Table, Container, Row, Card, CardHeader, Col, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import Header from 'components/Headers/Header';

const ControleList = () => {
  const [controles, setControles] = useState([]);
  const [selectedControle, setSelectedControle] = useState(null);
  const [newControle, setNewControle] = useState({
    venda: '',
    numero_parcela: '',
    data_parcela: '',
    valor_comissao: '',
    confirmacao_pagamento: 'Aguardando',
    codigo_extrato: ''
  });
  const [vendas, setVendas] = useState([]);

  useEffect(() => {
    // Buscar vendas para preencher o dropdown
    axios.get('http://localhost:8000/api/vendas/')
      .then(response => setVendas(response.data))
      .catch(error => console.error('Erro ao buscar vendas', error));

    // Buscar controles de recebimento
    axios.get('http://localhost:8000/api/controles_recebimento/')
      .then(response => setControles(response.data))
      .catch(error => console.error('Erro ao buscar controles de recebimento', error));
  }, []);

  const handleSaveControle = (e) => {
    e.preventDefault();
    const controleData = selectedControle || newControle;

    if (selectedControle) {
      axios.put(`http://localhost:8000/api/controles_recebimento/${selectedControle.id}/`, controleData)
        .then(() => {
          setControles(controles.map(controle => controle.id === selectedControle.id ? controleData : controle));
          setSelectedControle(null);
        })
        .catch(error => console.error('Erro ao modificar controle de recebimento', error));
    } else {
      axios.post('http://localhost:8000/api/controles_recebimento/', controleData)
        .then(response => {
          setControles([...controles, response.data]);
          setNewControle({
            venda: '',
            numero_parcela: '',
            data_parcela: '',
            valor_comissao: '',
            confirmacao_pagamento: 'Aguardando',
            codigo_extrato: ''
          });
        })
        .catch(error => console.error('Erro ao cadastrar controle de recebimento', error));
    }
  };

  const handleSelectControle = (controle) => {
    setSelectedControle(controle);
  };

  const handleDeleteControle = () => {
    if (selectedControle) {
      axios.delete(`http://localhost:8000/api/controles_recebimento/${selectedControle.id}/`)
        .then(() => {
          setControles(controles.filter(controle => controle.id !== selectedControle.id));
          setSelectedControle(null);
        })
        .catch(error => console.error('Erro ao deletar controle de recebimento', error));
    }
  };

  const handleNewControle = () => {
    setSelectedControle(null);
    setNewControle({
      venda: '',
      numero_parcela: '',
      data_parcela: '',
      valor_comissao: '',
      confirmacao_pagamento: 'Aguardando',
      codigo_extrato: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (selectedControle) {
      setSelectedControle({ ...selectedControle, [name]: value });
    } else {
      setNewControle({ ...newControle, [name]: value });
    }
  };

  // Criar mapa de vendas para acesso rápido
  const vendasMap = useMemo(() => {
    return vendas.reduce((map, venda) => {
      map[venda.id] = venda;
      return map;
    }, {});
  }, [vendas]);

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          {/* Coluna da lista de controles de recebimento */}
          <Col xl="8">
            <Card className="bg-default shadow">
              <CardHeader className="bg-transparent border-0">
                <h3 className="text-white mb-0">Controle de Recebimentos</h3>
              </CardHeader>
              <Table className="align-items-center table-dark table-flush" responsive>
                <thead className="thead-dark">
                  <tr>
                    <th>ID</th>
                    <th>Proposta</th>
                    <th>Parcela Nº</th>
                    <th>Data da Parcela</th>
                    <th>Valor Comissão</th>
                    <th>Status Pagamento</th>
                  </tr>
                </thead>
                <tbody>
                  {controles.map(controle => {
                    const venda = vendasMap[controle.venda];
                    return (
                      <tr key={controle.id} onClick={() => handleSelectControle(controle)}>
                        <td>{controle.id}</td>
                        <td>{venda ? venda.numero_proposta : controle.venda}</td>
                        <td>{controle.numero_parcela}</td>
                        <td>{controle.data_parcela}</td>
                        <td>{controle.valor_comissao}</td>
                        <td>{controle.confirmacao_pagamento}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card>
          </Col>

          {/* Coluna do formulário de cadastro/edição */}
          <Col xl="4" className="mb-0">
            <Card className="bg-secondary shadow">
              <CardHeader className="border-0 d-flex justify-content-between align-items-center">
                <h3 className="mb-0">{selectedControle ? 'Editar Controle' : 'Cadastrar Novo Controle'}</h3>
                {selectedControle && (
                  <Button color="info" onClick={handleNewControle}>Novo Controle</Button>
                )}
              </CardHeader>
              <Form onSubmit={handleSaveControle} className="p-3">
                {/* Formulário de entrada de dados */}
                <FormGroup>
                  <Label for="venda">Venda (Proposta)</Label>
                  <Input type="select" name="venda" id="venda" value={selectedControle ? selectedControle.venda : newControle.venda} onChange={handleInputChange} required>
                    <option value="">Selecione a venda</option>
                    {vendas.map(venda => <option key={venda.id} value={venda.id}>{venda.numero_proposta}</option>)}
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label for="numero_parcela">Número da Parcela</Label>
                  <Input type="number" name="numero_parcela" id="numero_parcela" value={selectedControle ? selectedControle.numero_parcela : newControle.numero_parcela} onChange={handleInputChange} required />
                </FormGroup>
                <FormGroup>
                  <Label for="data_parcela">Data da Parcela</Label>
                  <Input type="date" name="data_parcela" id="data_parcela" value={selectedControle ? selectedControle.data_parcela : newControle.data_parcela} onChange={handleInputChange} required />
                </FormGroup>
                <FormGroup>
                  <Label for="valor_comissao">Valor da Comissão</Label>
                  <Input type="number" name="valor_comissao" id="valor_comissao" value={selectedControle ? selectedControle.valor_comissao : newControle.valor_comissao} onChange={handleInputChange} required />
                </FormGroup>
                <FormGroup>
                  <Label for="confirmacao_pagamento">Confirmação de Pagamento</Label>
                  <Input type="select" name="confirmacao_pagamento" id="confirmacao_pagamento" value={selectedControle ? selectedControle.confirmacao_pagamento : newControle.confirmacao_pagamento} onChange={handleInputChange} required>
                    <option value="Pago">Pago</option>
                    <option value="Aguardando">Aguardando</option>
                    <option value="Inadimplente">Inadimplente</option>
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label for="codigo_extrato">Código do Extrato</Label>
                  <Input type="text" name="codigo_extrato" id="codigo_extrato" value={selectedControle ? selectedControle.codigo_extrato : newControle.codigo_extrato} onChange={handleInputChange} />
                </FormGroup>

                <Button type="submit" color="primary">
                  {selectedControle ? 'Modificar' : 'Cadastrar'}
                </Button>
                {selectedControle && (
                  <Button color="danger" className="ml-2" onClick={handleDeleteControle}>Deletar</Button>
                )}
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ControleList;
