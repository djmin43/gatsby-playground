import { graphql, useStaticQuery } from "gatsby";
import { IProgrammer } from "../types/programmer";

export const useProgrammerListQuery = (): IProgrammer[] => {
  const {
    allContentfulPage: { nodes },
  } = useStaticQuery(graphql`
    query ProgrammerListQuery {
      allContentfulPage {
        nodes {
          id
          name
          url
          description
          mainLanguage
          image {
            gatsbyImage(width: 200, height: 200)
          }
        }
      }
    }
  `);
  return nodes;
};