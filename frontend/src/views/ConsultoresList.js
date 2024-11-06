import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Container, Row, Card, CardHeader, Col, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import Header from 'components/Headers/Header';

const ConsultoresList = () => {
  const [consultores, setConsultores] = useState([]);
  const [selectedConsultor, setSelectedConsultor] = useState(null);  // Consultor selecionado para edição
  const [newConsultor, setNewConsultor] = useState({ nome_consultor: '' });

  useEffect(() => {
    axios.get('http://localhost:8000/api/consultores/')
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
      axios.put(`http://localhost:8000/api/consultores/${selectedConsultor.id}/`, selectedConsultor)
        .then(() => {
          setConsultores(consultores.map(consultor => consultor.id === selectedConsultor.id ? selectedConsultor : consultor));
          setSelectedConsultor(null);  // Limpa o formulário
        })
        .catch((error) => {
          console.error('Erro ao modificar consultor', error);
        });
    } else {
      // Adicionar novo consultor
      axios.post('http://localhost:8000/api/consultores/', newConsultor)
        .then((response) => {
          setConsultores([...consultores, response.data]);
          setNewConsultor({ nome_consultor: '' });  // Limpa o formulário
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
      axios.delete(`http://localhost:8000/api/consultores/${selectedConsultor.id}/`)
        .then(() => {
          setConsultores(consultores.filter(consultor => consultor.id !== selectedConsultor.id));
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
    setNewConsultor({ nome_consultor: '' });
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
                  </tr>
                </thead>
                <tbody>
                  {consultores.map((consultor) => (
                    <tr key={consultor.id} onClick={() => handleSelectConsultor(consultor)}>

                      <td>{consultor.nome_consultor}</td>
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
                      name="nome_consultor"
                      id="nome_consultor"
                      value={selectedConsultor ? selectedConsultor.nome_consultor : newConsultor.nome_consultor}
                      onChange={handleInputChange}
                      placeholder="Digite o nome do consultor"
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
