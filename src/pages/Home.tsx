import { Button } from "@evoapi/design-system/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@evoapi/design-system/card";
import { Badge } from "@evoapi/design-system/badge";
import { ArrowRight, MessageSquare, Shield, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageToggle } from "@/components/language-toggle";

export default function Home() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleGoToManager = () => {
    navigate("/manager");
  };

  const evolutionLogo =
    theme === "dark"
      ? "https://evolution-api.com/files/evo/evolution-logo-white.svg"
      : "https://evolution-api.com/files/evo/evolution-logo.svg";

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border px-4 py-3 md:px-8">
        <img
          src="/assets/images/rei-do-ti-logo-transparent.png"
          alt="REI DO T.I. — Soluções em Tecnologia"
          className="h-12 w-auto object-contain"
        />
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <span>Tecnologia</span>
            <img src={evolutionLogo} alt="Evolution API" className="h-5 w-auto" />
          </div>
          <LanguageToggle />
          <ModeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          <section className="mb-10 text-center">
            <img
              src="/assets/images/rei-do-ti-logo-transparent.png"
              alt="REI DO T.I."
              className="mx-auto mb-6 h-24 max-w-full object-contain md:h-28"
            />
            <h1 className="mb-4 text-4xl font-bold text-foreground">
              Manager REI DO T.I.
            </h1>
            <p className="mb-6 text-lg text-muted-foreground md:text-xl">
              Gestão centralizada das conexões e instâncias de atendimento do REI DO T.I.
            </p>
            <Badge variant="secondary" className="px-3 py-1 text-sm">
              Tecnologia Evolution API v2
            </Badge>
          </section>

          <Card className="mb-8 border-primary/30 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Painel de gerenciamento
              </CardTitle>
              <CardDescription>
                Ambiente administrativo para acompanhar conexões, mensagens e configurações do WhatsApp.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-border p-4 text-center">
                  <Smartphone className="mx-auto mb-2 h-6 w-6 text-primary" />
                  <p className="font-medium">Instâncias</p>
                  <p className="text-sm text-muted-foreground">Conexões organizadas em um só lugar</p>
                </div>
                <div className="rounded-lg border border-border p-4 text-center">
                  <MessageSquare className="mx-auto mb-2 h-6 w-6 text-primary" />
                  <p className="font-medium">Mensagens</p>
                  <p className="text-sm text-muted-foreground">Monitoramento de eventos e conversas</p>
                </div>
                <div className="rounded-lg border border-border p-4 text-center">
                  <Shield className="mx-auto mb-2 h-6 w-6 text-primary" />
                  <p className="font-medium">Acesso protegido</p>
                  <p className="text-sm text-muted-foreground">Credenciais exigidas para entrar</p>
                </div>
              </div>

              <div className="flex justify-center border-t border-border pt-6">
                <Button onClick={handleGoToManager} size="lg" className="px-8 py-3">
                  Acessar o Manager
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Base tecnológica e licenciamento</CardTitle>
              <CardDescription>
                Esta interface utiliza o Evolution Manager para administrar a Evolution API.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <img src={evolutionLogo} alt="Evolution API" className="h-8 w-auto self-start" />
              <div className="flex gap-4 text-sm">
                <a
                  href="https://github.com/evolution-foundation/evolution-manager-v2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  Código oficial
                </a>
                <a
                  href="https://docs.evolutionfoundation.com.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  Documentação
                </a>
              </div>
            </CardContent>
          </Card>

          <footer className="mt-10 space-y-1 text-center text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} REI DO T.I. — Soluções em Tecnologia.</p>
            <p>Evolution Manager e Evolution API são tecnologias da Evolution Foundation, com direitos e licença preservados.</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
