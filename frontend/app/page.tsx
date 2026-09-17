const Home = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
    cache: "no-store",
  });

  const health = await response.json();

  return (
    <main>
      <h1>Safar.pk</h1>

      <p>Frontend: Running</p>
      <p>Backend: {health.status}</p>
      <p>Health Service: {health.service}</p>
      <p>Health timestamp: {health.timestamp}</p>
    </main>
  );
};

export default Home