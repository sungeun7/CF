import HomeFeed from "./HomeFeed";

/** 피드 데이터는 API에서만 읽습니다. RSC에서 readStore()를 호출하지 않아 / 500을 피합니다. */
export default function HomePage() {
  return <HomeFeed />;
}
