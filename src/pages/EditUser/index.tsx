import { useForm } from "react-hook-form";
import type { IEditUserFormData, IUser } from "@/pages/EditUser/types";
import { Content } from "@/components/Layout/Content";
import PermIdentityOutlinedIcon from "@mui/icons-material/PermIdentityOutlined";
import MusicNoteOutlinedIcon from "@mui/icons-material/MusicNoteOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";

export function EditUser() {
  const [user, setUser] = useState<IUser>({} as IUser);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit: hookFormHandleSubmit } =
    useForm<IEditUserFormData>();

  const getUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payloadBase64 = token.split(".")[1];
      const tokenData = JSON.parse(atob(payloadBase64));
      const userId = tokenData.userId;

      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API}/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data: IUser = await response.json();
      setUser(data);
    } catch (error) {
      console.error("Erro ao buscar informações do usuário:", error);
    }
  };

  const handleEditUser = async ({
    bio,
    instrument,
    level,
    username,
  }: IEditUserFormData) => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payloadBase64 = token.split(".")[1];
      const tokenData = JSON.parse(atob(payloadBase64));
      const userId = tokenData.userId;

      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API}/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bio: bio,
            instrument: instrument,
            level: level,
            username: username,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Erro na requisição");
      }

      setIsLoading(false);
      window.location.reload();
    } catch (error) {
      setIsLoading(false);
      console.error("Erro ao atualizar usuário:", error);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <Content>
      <div className="bg-slate-950 min-h-screen p-4 md:p-8 -mt-2 -ml-2">
        <h1 className="text-white text-2xl text-center">Meu Perfil</h1>
        <form
          className="w-[70%] mx-auto mt-6 bg-slate-800 border border-[rgb(45,57,83)] rounded-md p-6 text-white"
          onSubmit={hookFormHandleSubmit(handleEditUser)}
        >
          <div className="flex justify-between align-center flex-row">
            <div>
              <label
                htmlFor="username"
                className="font-medium flex mb-[0.7rem] items-center gap-0.5"
              >
                <PermIdentityOutlinedIcon fontSize="small" />
                Nome
              </label>
              <input
                {...register("username")}
                placeholder={user.username}
                className="w-full h-8 p-1.5 border border-[rgb(45, 57, 83)] rounded-md text-sm"
              ></input>
            </div>

            <div>
              <label
                htmlFor="instrument"
                className="font-medium flex mb-[0.7rem] items-center gap-0.5"
              >
                <MusicNoteOutlinedIcon fontSize="small" />
                Instrumento principal
              </label>
              <input
                {...register("instrument")}
                placeholder={
                  user.instrument || "Ex: Guitarra, Piano, Violão..."
                }
                className="w-full h-8 p-1.5 border border-[rgb(45, 57, 83)] rounded-md text-sm"
              ></input>
            </div>
          </div>

          <div className="mt-4">
            <label
              htmlFor="level"
              className="font-medium flex mb-[0.7rem] items-center gap-0.5"
            >
              <WorkspacePremiumOutlinedIcon fontSize="small" />
              Nível
            </label>
            <input
              {...register("level")}
              placeholder={user.instrument || "Ex: Guitarra, Piano, Violão..."}
              className="w-full h-8 p-1.5 border border-[rgb(45, 57, 83)] rounded-md text-sm"
            ></input>
          </div>

          <div className="mt-4">
            <label
              htmlFor="bio"
              className="font-medium inline-block mb-[0.7rem]"
            >
              Sobre mim
            </label>
            <textarea
              {...register("bio")}
              rows={3}
              placeholder={
                user.bio || "Conte um pouco sobre sua jornada musical..."
              }
              className="w-full h-8 p-1.5 border border-[rgb(45, 57, 83)]  flex min-h-20 w-full px-3 py-2 text-sm"
            ></textarea>
          </div>

          {isLoading ? (
            <div className="w-full flex items-center justify-center text-orange-600 mt-1">
              <CircularProgress color="inherit" />
            </div>
          ) : (
            <button
              className="font-medium mt-4 w-[20%] bg-orange-500 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm cursor-pointer transition-colors  text-black hover:bg-orange-500/80 h-10 px-4 py-2"
              type="submit"
            >
              <SaveOutlinedIcon fontSize="small" />
              Salvar
            </button>
          )}
        </form>
      </div>
    </Content>
  );
}
