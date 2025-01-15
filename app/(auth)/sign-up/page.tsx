"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { authSchema, TAuthSchema } from "@/auth/schema/authSchema";
import { createUser } from "@/auth/actions/auth-actions";
import { User } from "@/auth/types/user";
import { toast } from "sonner";

const Page = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TAuthSchema>({
    resolver: zodResolver(authSchema),
  });
  const router = useRouter();

  const onSubmit = async ({ email, password, name }: TAuthSchema) => {
    let user: User = {
      email,
      name,
      active: 0,
      isAdmin: 0,
      password: password,
    };

    const res = await createUser(user);

    if (res.insertedId) {
      toast.success(
        "Conta criada com sucesso, solicite ao administrador para ativar sua conta"
      );
      router.push("/sign-in");
    } else {
      toast.error("Erro ao criar conta ou email já cadastrado");
    }
  };

  return (
    <>
      <div className="container relative flex pt-20 flex-col items-center justify-center lg:px-0">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col items-center space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Criar sua conta
            </h1>

            <Link
              className={buttonVariants({
                variant: "link",
                className: "gap-1.5",
              })}
              href="/sign-in"
            >
              Já possui conta? Logar-se
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-2">
                <div className="grid gap-1 py-2">
                  <Label htmlFor="email">Nome</Label>
                  <Input
                    required
                    {...register("name")}
                    className={cn({
                      "focus-visible:ring-red-500": errors.name,
                    })}
                    placeholder="Nome completo"
                  />
                  {errors?.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-1 py-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    required
                    {...register("email")}
                    className={cn({
                      "focus-visible:ring-red-500": errors.email,
                    })}
                    placeholder="Informe o seu email"
                  />
                  {errors?.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-1 py-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    required
                    {...register("password")}
                    type="password"
                    className={cn({
                      "focus-visible:ring-red-500": errors.password,
                    })}
                    placeholder="Senha..."
                  />
                  {errors?.password && (
                    <p className="text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button>Cadastrar</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
