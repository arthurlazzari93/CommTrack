

import { Row, Col, Nav } from "reactstrap";

const Footer = () => {
  return (
    <footer className="footer">
      <Row className="align-items-center justify-content-xl-between">
        <Col xl="6">
          <div className="copyright text-center text-xl-left text-muted">
            © {new Date().getFullYear()}{" "}
            <a
              className="font-weight-bold ml-1"
              href="https://www.lazzariseguros.com.br"
              rel="noopener noreferrer"
              target="_blank"
            >
              Lazzari Seguros
            </a>
          </div>
        </Col>
        <Col xl="6">
          <Nav className="nav-footer justify-content-center justify-content-xl-end">
          </Nav>
        </Col>
      </Row>
    </footer>
  );
};

export default Footer;
