import Image from "next/image";

export default function SocialProof() {
  const testimonials = [
    {
      quote:
        "Com a integração, conseguimos aumentar nossas vendas em 35% no Mercado Livre e eliminamos 90% dos erros de atualização de estoque.",
      author: "Atacado ***",
      image: "/placeholder.svg",
    },
    {
      quote:
        "Automatizamos a gestão de mais de 10.000 produtos com nossa solução WinThor integrada ao Tiny ERP.",
      author: "Distribuidora ***",
      image: "/placeholder.svg",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          O que nossos clientes dizem
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-md">
              <p className="text-lg mb-4 italic">"{testimonial.quote}"</p>
              <div className="flex items-center">
                <Image
                  src={testimonial.image}
                  alt={testimonial.author}
                  width={50}
                  height={50}
                  className="rounded-full mr-4"
                />
                <span className="font-semibold">{testimonial.author}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
