import { ProductDetail } from "./product-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  return <ProductDetail id={id} />;
}
