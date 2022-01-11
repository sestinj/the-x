import { createToken } from "../functions";
import { Button, Link } from "../components";
import Layout from "../components/Layout";

const Home = () => {
  return (
    <>
      <Layout>
        <Link to="/createToken">Create Token</Link>
        <Link to="/exchange">Exchange</Link>
      </Layout>
    </>
  );
};

export default Home;
