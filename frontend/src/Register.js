import React, { useState } from "react";
import api from "api";  // Conecte com sua API backend
import { Button, Card, FormGroup, Form, Input, Row, Col } from "reactstrap";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("register/", {
        username: username,
        email: email,
        password: password,
      });
      alert("Usuário registrado com sucesso");
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
    }
  };

  return (
    <Col lg="5" md="7">
      <Card className="bg-secondary shadow border-0">
        <div className="text-center text-muted mb-4">
          <small>Crie uma conta</small>
        </div>
        <Form role="form" onSubmit={handleRegister}>
          <FormGroup>
            <Input
              placeholder="Nome de usuário"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Input
              placeholder="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormGroup>
          <div className="text-center">
            <Button className="my-4" color="primary" type="submit">
              Registrar
            </Button>
          </div>
        </Form>
      </Card>
    </Col>
  );
};

export default Register;
