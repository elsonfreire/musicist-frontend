import {
  MusicNoteOutlined,
  HeadphonesOutlined,
  PianoOutlined,
} from "@mui/icons-material";

import { CircularProgress } from "@mui/material";

import { useNavigate } from "react-router";

import { useForm } from "react-hook-form";
import type { IRegisterFormData } from "./types";
import { useState } from "react";

export const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister({
    email,
    password,
    username,
  }: IRegisterFormData) {
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
            username: username,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Erro na requisição");
      }

      navigate("/");
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    }
  }

  const {
    register,
    handleSubmit: hookFormHandleSubmit,
    formState: { errors },
  } = useForm<IRegisterFormData>();

  return (
    <div className="bg-[#151a37] text-white flex justify-center items-center flex-col gap-5 h-screen w-screen">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <MusicNoteOutlined
          sx={{ fontSize: 64 }}
          className="h- absolute top-[10%] left-[5%] text-orange-600/10 rotate-12"
        />
        <PianoOutlined
          sx={{ fontSize: 80 }}
          className="absolute top-[20%] right-[10%] h-20 w-20 text-orange-600/10 -rotate-12"
        />
        <HeadphonesOutlined
          sx={{ fontSize: 56 }}
          className="absolute bottom-[15%] left-[15%] text-orange-600/10 rotate-6"
        />
        <MusicNoteOutlined
          sx={{ fontSize: 48 }}
          className="absolute bottom-[25%] right-[5%] text-orange-600/10 -rotate-6"
        />
      </div>

      <div className="w-115 max-w-[90vw] h-auto bg-slate-800 shadow-[rgba(0,0,0,0.2)_0px_12px_28px_0px] rounded-lg flex flex-col items-center p-6 border border-[rgb(45,57,83)]">
        <div className="font-space-grotesk font-bold text-2xl font-display text-orange-600 flex items-center justify-end gap-1">
          {" "}
          <MusicNoteOutlined fontSize="medium" />
          Musicist
        </div>
        <h3 className="mt-3 text-xl font-space-grotesk w-full h-full flex justify-center">
          Criar conta
        </h3>
        <p className="mt-3 text-slate-400">Comece sua jornada musical hoje</p>

        <form
          className="w-[90%] mx-auto mt-6"
          onSubmit={hookFormHandleSubmit(handleRegister)}
        >
          <div>
            <label
              htmlFor="username"
              className="font-medium inline-block mb-[0.7rem]"
            >
              Nome
            </label>
            <input
              {...register("username", {
                required: {
                  value: true,
                  message: "Este campo é obrigatório. Informe seu nome.",
                },
              })}
              placeholder="Seu nome"
              className="w-full h-8 p-1.5 border border-[rgb(45, 57, 83)] rounded"
            ></input>
            {errors.username && (
              <small className="text-red-500 font-medium">
                {errors.username.message}
              </small>
            )}
          </div>

          <div className="mt-4">
            <label
              htmlFor="email"
              className="font-medium inline-block mb-[0.7rem]"
            >
              E-mail
            </label>
            <input
              {...register("email", {
                required: {
                  value: true,
                  message: "Este campo é obrigatório. Informe seu e-mail.",
                },
              })}
              placeholder="seu@email.com"
              className="w-full h-8 p-1.5 border border-[rgb(45, 57, 83)] rounded"
            ></input>
            {errors.email && (
              <small className="text-red-500 font-medium">
                {errors.email.message}
              </small>
            )}
          </div>

          <div className="mt-4">
            <label
              htmlFor="password"
              className="font-medium inline-block mb-[0.7rem]"
            >
              Senha
            </label>
            <input
              {...register("password", {
                required: {
                  value: true,
                  message: "Este campo é obrigatório. Informe sua senha.",
                },
              })}
              placeholder="******"
              type="password"
              className="w-full h-8 p-1.5 border border-[rgb(45, 57, 83)] rounded"
            ></input>
            {errors.password && (
              <small className="text-red-500 font-medium">
                {errors.password.message}
              </small>
            )}
          </div>

          {isLoading ? (
            <div className="w-full flex items-center justify-center text-orange-600 mt-1">
              <CircularProgress color="inherit" />
            </div>
          ) : (
            <button
              className="font-medium mt-4 w-full bg-orange-500 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm cursor-pointer transition-colors  text-black hover:bg-orange-500/80 h-10 px-4 py-2"
              type="submit"
            >
              Entrar
            </button>
          )}
        </form>
        <a
          href="#"
          className="mt-4 text-slate-400"
          onClick={() => navigate("/")}
        >
          Já tem conta? Entrar
        </a>
      </div>
    </div>
  );
};
