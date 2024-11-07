import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Container, Row, Card, CardHeader, Col, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import Header from 'components/Headers/Header';

const ConsultoresList = () => {
  const [consultor, setConsultores] = useState([]);
  const [selectedConsultor, setSelectedConsultor] = useState(null);  // Consultor selecionado para edição
  const [newConsultor, setNewConsultor] = useState({ 
    nome: '',
    telefone: '',
    email: ''
  
  });

  useEffect(() => {
    axios.get('http://localhost:8000/api/consultor/')
      .then((response) => {
        setConsultores(response.data);
      })
      .catch((error) => {
        console.error('Erro ao buscar consultores', error);
      });
  }, []);

  // Função para cadastrar ou modificar o consultor
  const handleSaveConsultor = (e) => {
    e.preventDefault();

    if (selectedConsultor) {
      // Atualizar consultor existente
      axios.put(`http://localhost:8000/api/consultor/${selectedConsultor.id}/`, selectedConsultor)
        .then(() => {
          setConsultores(consultor.map(consultor => consultor.id === selectedConsultor.id ? selectedConsultor : consultor));
          setSelectedConsultor(null);  // Limpa o formulário
        })
        .catch((error) => {
          console.error('Erro ao modificar consultor', error);
        });
    } else {
      // Adicionar novo consultor
      axios.post('http://localhost:8000/api/consultor/', newConsultor)
        .then((response) => {
          setConsultores([...consultor, response.data]);
          setNewConsultor({ nome: '' });  // Limpa o formulário
        })
        .catch((error) => {
          console.error('Erro ao cadastrar consultor', error);
        });
    }
  };

  // Função para carregar dados do consultor selecionado no formulário
  const handleSelectConsultor = (consultor) => {
    setSelectedConsultor(consultor);
  };

  // Função para deletar consultor
  const handleDeleteConsultor = () => {
    if (selectedConsultor) {
      axios.delete(`http://localhost:8000/api/consultor/${selectedConsultor.id}/`)
        .then(() => {
          setConsultores(consultor.filter(consultor => consultor.id !== selectedConsultor.id));
          setSelectedConsultor(null);  // Limpa o formulário
        })
        .catch((error) => {
          console.error('Erro ao deletar consultor', error);
        });
    }
  };

  // Função para limpar o formulário e voltar ao estado de cadastro
  const handleNewConsultor = () => {
    setSelectedConsultor(null);
    setNewConsultor({ nome: '' });
  };

  // Atualiza os valores no formulário
  const handleInputChange = (e) => {
    if (selectedConsultor) {
      setSelectedConsultor({ ...selectedConsultor, [e.target.name]: e.target.value });
    } else {
      setNewConsultor({ ...newConsultor, [e.target.name]: e.target.value });
    }
  };

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          {/* Coluna da lista de consultores */}
          <Col xl="8">
            <Card className="bg-default shadow">
              <CardHeader className="bg-transparent border-0">
                <h3 className="text-white mb-0">Lista de Consultores</h3>
              </CardHeader>
              <Table className="align-items-center table-dark table-flush" responsive>
                <thead className="thead-dark">
                  <tr>

                    <th>Nome do Consultor</th>
                    <th>Telefone</th>
                    <th>E-mail</th>
                  </tr>
                </thead>
                <tbody>
                  {consultor.map((consultor) => (
                    <tr key={consultor.id} onClick={() => handleSelectConsultor(consultor)}>

                      <td>{consultor.nome}</td>
                      <td>{consultor.telefone}</td>
                      <td>{consultor.email}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </Col>

          {/* Coluna do formulário de cadastro/edição de consultor */}
          <Col xl="4" className="mb-0">
            <Card className="bg-secondary shadow">
              <CardHeader className="border-0 d-flex justify-content-between align-items-center">
                <h3 className="mb-0">{selectedConsultor ? 'Editar Consultor' : 'Cadastrar Novo Consultor'}</h3>
                {selectedConsultor && (
                  <Button color="info" onClick={handleNewConsultor}>Novo Consultor</Button>
                )}
              </CardHeader>
              <Col xl="12" className="mb-4">
                <Form onSubmit={handleSaveConsultor}>
                  <FormGroup>
                    <Label className="form-control-label">Nome do Consultor</Label>
                    <Input
                      type="text"
                      name="nome"
                      id="nome"
                      value={selectedConsultor ? selectedConsultor.nome : newConsultor.nome}
                      onChange={handleInputChange}
                      placeholder="Digite o nome do consultor"
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label className="form-control-label">Telefone</Label>
                    <Input
                      type="number"
                      name="telefone"
                      id="telefone"
                      value={selectedConsultor ? selectedConsultor.telefone : newConsultor.telefone}
                      onChange={handleInputChange}
                      placeholder="(11) 90000-0000"
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label className="form-control-label">E-mail</Label>
                    <Input
                      type="text"
                      name="email"
                      id="email"
                      value={selectedConsultor ? selectedConsultor.email : newConsultor.email}
                      onChange={handleInputChange}
                      placeholder="exemplo@sistema.com.br"
                      required
                    />
                  </FormGroup>
                  <Button type="submit" color="primary">
                    {selectedConsultor ? 'Modificar' : 'Cadastrar'}
                  </Button>
                  {selectedConsultor && (
                    <Button color="danger" onClick={handleDeleteConsultor} className="ml-2">
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

export default ConsultoresList;
