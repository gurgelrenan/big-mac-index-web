import Head from 'next/head'

export async function getStaticProps() {
  const res = await fetch('https://big-mac-index-api.herokuapp.com/api/v1/big_macs/latest');
  const allIndexes = await res.json();
  return {
    props: {
      allIndexes
    },
  }
}

export default function Home({allIndexes}) {
  return (
    <div className="container">
      <Head>
        <title>Big Mac Index</title>
      </Head>

      <main>
        <h1 className="title">Big Mac Values</h1>

        <ul>
          {allIndexes['data'].map((index) => (
            <li key={index.id}>
              {index.attributes.name} -
              {index.attributes.currency_code}
              {index.attributes.local_price}
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
