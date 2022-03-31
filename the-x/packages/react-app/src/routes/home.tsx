import styled, { keyframes } from "styled-components";
import { Pulse } from "../components";
import Layout from "../components/Layout";

// KEYFRAMES

const seq = [2, 2];

const rotate = keyframes`
  0% {
    transform: scale(0.01) rotate(${360 * 2}deg);
  }
`;
const fadein = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

const dropShadowSize = 1;

const Rotate = styled.div`
  animation: ${rotate} ${seq[0]}s cubic-bezier(1, 0, 1, 1);
`;
const FadeIn = styled.div`
  animation: ${fadein} ${seq[1]}s ease-in;
  animation-delay: ${seq[0]}s;
  opacity: 0;
  animation-fill-mode: forwards;
`;

const Home = () => {
  return (
    <>
      <Layout>
        <FadeIn>
          <img
            src="/the_x.svg"
            style={{ width: "50vmin", height: "25vmin" }}
          ></img>
        </FadeIn>

        <Rotate>
          <Pulse>
            <img
              src="/x.svg"
              style={{
                width: "50vmin",
                height: "50vmin",
              }}
            ></img>
          </Pulse>
        </Rotate>
      </Layout>
    </>
  );
};

export default Home;
