/* /contacto — página de contacto del landing. El formulario es un Client
   Component (estado/validación/Server Action); esta página solo aporta metadata
   y lo compone. El envío va por Server Action a services/api (no llama al API
   desde el cliente). Ver change contacto-form-landing (#48). */
import { ContactoForm } from "@/components/contacto/ContactoForm";

export const metadata = {
  title: "Contacto",
  description:
    "Escríbenos: preguntas, voluntariado, prensa o alianzas para la defensa del humedal del Chirimoyo.",
  alternates: { canonical: "/contacto" },
};

export default function ContactoPage() {
  return <ContactoForm />;
}
