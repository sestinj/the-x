import { Button } from "./components";
import { createToken } from "./functions";

const App = () => {
  return (
    <>
      <Button onClick={createToken}>Create Token</Button>
    </>
  );
};

export default App;
