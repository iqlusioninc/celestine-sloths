import type { NextPage } from "next"
import { Container } from '@chakra-ui/react';
import SnapshotCard from "../../components/Snapshot/SnapshotCard";

const Snapshot: NextPage = () => {
  return (
        <Container centerContent paddingY={8}>
          <SnapshotCard />
        </Container>
  )
}

export default Snapshot
