import { createToken } from "../functions";
import { Button, Link } from "../components";
import Layout from "../components/Layout";

const Home = () => {
  return (
    <>
      <Layout>
        <Button onClick={createToken}>Create Token</Button>
        <Link to="/exchange">Exchange</Link>
      </Layout>
    </>
  );
};

export default Home;
