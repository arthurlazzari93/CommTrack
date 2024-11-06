import React, { useState, useEffect } from 'react';
import axios from 'axios';  
import { Table, Container, Row, Card, CardHeader, Col, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import Header from 'components/Headers/Header';

const PlanosList = () => {
  const [planos, setPlanos] = useState([]);
  const [selectedPlano, setSelectedPlano] = useState(null);
  const [comissoes, setComissoes] = useState({});
  
  const [newPlano, setNewPlano] = useState({
    nome_plano: '',
    tipo_plano: '',
    taxa_administrativa: '',
    parcelas_total: ''
  });

  useEffect(() => {
    // Carregar todos os planos de uma vez
    axios.get('http://localhost:8000/api/planos/')
      .then((response) => {
        setPlanos(response.data);
      })
      .catch((error) => {
        console.error('Erro ao buscar planos', error);
      });
  
    // Carregar todas as comissões de uma vez e organizar no estado
    axios.get('http://localhost:8000/api/comissoes-planos/')
      .then((comissoesResponse) => {
        const comissoesMap = {};
        comissoesResponse.data.forEach((comissao) => {
          comissoesMap[`${comissao.plano}-${comissao.parcela_numero}`] = {
            id: comissao.id,
            porcentagem_comissao: comissao.porcentagem_comissao
          };
        });
        setComissoes(comissoesMap);
      })
      .catch(error => console.error('Erro ao carregar comissões:', error));
  }, []);
  
  
  
  
  
  const handleSaveComissao = (planoId, parcela_numero) => {
    // Obtenha o valor da comissão para a parcela e plano específicos
    const porcentagem_comissao = comissoes[`${planoId}-${parcela_numero}`]?.porcentagem_comissao || '0';
  
    // Verifique se existe uma comissão no estado para esta combinação
    if (comissoes[`${planoId}-${parcela_numero}`]?.id) {
      // Se já existe uma comissão para esta parcela do plano, faça uma atualização
      const comissaoId = comissoes[`${planoId}-${parcela_numero}`].id;
      axios.put(`http://localhost:8000/api/comissoes-planos/${comissaoId}/`, {
        plano: planoId,
        parcela_numero,
        porcentagem_comissao
      })
      .then(() => {
        console.log(`Parcela ${parcela_numero} do plano ${planoId} atualizada com sucesso.`);
      })
      .catch((error) => {
        console.error(`Erro ao atualizar a parcela ${parcela_numero} do plano ${planoId}:`, error);
      });
    } else {
      // Crie uma nova comissão se não existir para a parcela e plano específicos
      axios.post('http://localhost:8000/api/comissoes-planos/', {
        plano: planoId,
        parcela_numero,
        porcentagem_comissao
      })
      .then((response) => {
        console.log(`Nova comissão criada para a parcela ${parcela_numero} do plano ${planoId}.`);
        // Atualize o estado com o ID retornado para evitar duplicações futuras
        setComissoes(prevComissoes => ({
          ...prevComissoes,
          [`${planoId}-${parcela_numero}`]: {
            id: response.data.id,
            porcentagem_comissao: porcentagem_comissao
          }
        }));
      })
      .catch((error) => {
        console.error(`Erro ao criar nova comissão para a parcela ${parcela_numero} do plano ${planoId}:`, error);
      });
    }
  };
  
  
  

  const handleInputChangeComissao = (planoId, parcela_numero, porcentagem_comissao) => {
    setComissoes(prevComissoes => ({
      ...prevComissoes,
      [`${planoId}-${parcela_numero}`]: {
        ...prevComissoes[`${planoId}-${parcela_numero}`],
        porcentagem_comissao: porcentagem_comissao
      }
    }));
  };
  
  

  const handleSaveAllComissoes = (planoId) => {
    const totalParcelas = planos.find(plano => plano.id === planoId).parcelas_total;
  
    Array.from({ length: totalParcelas }).forEach((_, i) => {
      const parcela_numero = i + 1;
      const porcentagem_comissao = comissoes[`${planoId}-${parcela_numero}`]?.porcentagem_comissao || '0';
  
      if (comissoes[`${planoId}-${parcela_numero}`]?.id) {
        // Atualiza a comissão existente
        const comissaoId = comissoes[`${planoId}-${parcela_numero}`].id;
        axios.put(`http://localhost:8000/api/comissoes-planos/${comissaoId}/`, {
          plano: planoId,
          parcela_numero,
          porcentagem_comissao
        })
        .then(() => {
          console.log(`Parcela ${parcela_numero} do plano ${planoId} atualizada com sucesso.`);
        })
        .catch((error) => {
          console.error(`Erro ao atualizar a parcela ${parcela_numero} do plano ${planoId}:`, error);
        });
      } else {
        // Cria uma nova comissão para a parcela do plano
        axios.post('http://localhost:8000/api/comissoes-planos/', {
          plano: planoId,
          parcela_numero,
          porcentagem_comissao
        })
        .then((response) => {
          console.log(`Nova comissão criada para a parcela ${parcela_numero} do plano ${planoId}.`);
          setComissoes(prevComissoes => ({
            ...prevComissoes,
            [`${planoId}-${parcela_numero}`]: {
              id: response.data.id,
              porcentagem_comissao: porcentagem_comissao
            }
          }));
        })
        .catch((error) => {
          console.error(`Erro ao criar nova comissão para a parcela ${parcela_numero} do plano ${planoId}:`, error);
        });
      }
    });
  };
  
  
  
  
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (selectedPlano) {
      setSelectedPlano({ ...selectedPlano, [name]: value });
    } else {
      setNewPlano({ ...newPlano, [name]: value });
    }
  };

  const handleNewPlano = () => {
    setSelectedPlano(null);
    setNewPlano({
      nome_plano: '',
      tipo_plano: '',
      taxa_administrativa: '',
      parcelas_total: ''
    });
  };

  const handleDeletePlano = (id) => {
    axios.delete(`http://localhost:8000/api/planos/${id}/`)
      .then(() => {
        setPlanos(planos.filter(plano => plano.id !== id));
        setSelectedPlano(null);  // Limpa o formulário
      })
      .catch((error) => {
        console.error('Erro ao deletar plano', error);
      });
  };

  const handleSavePlano = (e) => {
    e.preventDefault();

    if (selectedPlano) {
      axios.put(`http://localhost:8000/api/planos/${selectedPlano.id}/`, selectedPlano)
        .then(() => {
          setPlanos(planos.map(plano => plano.id === selectedPlano.id ? selectedPlano : plano));
          setSelectedPlano(null);  // Limpa o formulário
        })
        .catch((error) => {
          console.error('Erro ao modificar plano', error);
        });
    } else {
      axios.post('http://localhost:8000/api/planos/', newPlano)
        .then((response) => {
          setPlanos([...planos, response.data]);
          setNewPlano({
            nome_plano: '',
            tipo_plano: '',
            taxa_administrativa: '',
            parcelas_total: ''
          });
        })
        .catch((error) => {
          console.error('Erro ao cadastrar plano', error);
        });
    }

    
  };

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
              {/* Linha do formulário de cadastro/edição de plano */}
      <Row>
      <Col>
    <Card className="bg-secondary shadow mb-4">
      <CardHeader className="border-0 d-flex justify-content-between align-items-center">
        <h3 className="mb-0">{selectedPlano ? 'Editar Plano' : 'Cadastrar Novo Plano'}</h3>
        {selectedPlano && (
          <Button color="info" onClick={handleNewPlano}>Novo Plano</Button>
        )}
      </CardHeader>
      <Form onSubmit={handleSavePlano} className="p-3">
        <Row>
        <Col md="3">
          <FormGroup>
            <Label for="nome_plano">Nome do Plano</Label>
            <Input
              type="text"
              name="nome_plano"
              id="nome_plano"
              value={selectedPlano ? selectedPlano.nome_plano : newPlano.nome_plano}
              onChange={handleInputChange}
              placeholder="Nome do plano"
              required
            />
          </FormGroup>
        </Col>
        <Col md="3">
          <FormGroup>
            <Label for="tipo_plano">Tipo do Plano</Label>
            <Input
              type="text"
              name="tipo_plano"
              id="tipo_plano"
              value={selectedPlano ? selectedPlano.tipo_plano : newPlano.tipo_plano}
              onChange={handleInputChange}
              placeholder="Tipo do plano"
              required
            />
          </FormGroup>
        </Col>
        <Col md="3">
          <FormGroup>
            <Label for="taxa_administrativa">Taxa Administrativa</Label>
            <Input
              type="number"
              step="0.01"
              name="taxa_administrativa"
              id="taxa_administrativa"
              value={selectedPlano ? selectedPlano.taxa_administrativa : newPlano.taxa_administrativa}
              onChange={handleInputChange}
              placeholder="Taxa administrativa"
              required
            />
          </FormGroup>
        </Col>
        <Col md="3">
          <FormGroup>
            <Label for="parcelas_total">Total de Parcelas</Label>
            <Input
              type="number"
              name="parcelas_total"
              id="parcelas_total"
              value={selectedPlano ? selectedPlano.parcelas_total : newPlano.parcelas_total}
              onChange={handleInputChange}
              placeholder="Total de parcelas"
              required
            />
          </FormGroup>
        </Col>
        </Row>
        <Button type="submit" color="primary">
          {selectedPlano ? 'Modificar' : 'Cadastrar'}
        </Button>
        {selectedPlano && (
          <Button color="danger" className="ml-2" onClick={() => handleDeletePlano(selectedPlano.id)}>Deletar</Button>
        )}
      </Form>
    </Card>
  </Col>
      </Row>

      {/* Linha da tabela de lista de planos */}
      <Row>
        <Col>
          <Card className="bg-default shadow">
            <CardHeader className="bg-transparent border-0">
              <h3 className="text-white mb-0">Lista de Planos</h3>
            </CardHeader>
            <Table className="align-items-center table-dark table-flush" responsive>
              <thead className="thead-dark">
                <tr>
                  <th>Ações</th>

                  <th>Nome do Plano</th>
                  <th>Tipo do Plano</th>
                  <th>Taxa Administrativa</th>

                  {Array.from({ length: Math.max(...planos.map(plano => plano.parcelas_total)) }, (_, i) => (
                    <th key={i}>Parcela {i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {planos.map((plano) => (
                  <tr key={plano.id}>
                    <td>
                      <Button color="info" href="#pablo" onClick={() => setSelectedPlano(plano)} size="sm">Modificar</Button>
                      <Button color="success" onClick={() => handleSaveAllComissoes(plano.id)} size="sm">Salvar Comissões</Button>
                    </td>

                    <td>{plano.nome_plano}</td>
                    <td>{plano.tipo_plano}</td>
                    <td>{plano.taxa_administrativa}</td>

                    {Array.from({ length: plano.parcelas_total }, (_, i) => (
                      <td key={i}>
                        <Input
                          type="number"
                          value={comissoes[`${plano.id}-${i + 1}`]?.porcentagem_comissao || ''}
                          onChange={(e) => handleInputChangeComissao(plano.id, i + 1, e.target.value)}
                          onBlur={() => handleSaveComissao(plano.id, i + 1)}
                          placeholder="%"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>
      </Row>
      </Container>
    </>
  );
};

export default PlanosList;
