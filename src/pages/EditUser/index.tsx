import { useForm } from "react-hook-form";
import type { IEditUserFormData } from "@/pages/EditUser/types";
import { Content } from "@/components/Layout/Content";
import PermIdentityOutlinedIcon from "@mui/icons-material/PermIdentityOutlined";
import MusicNoteOutlinedIcon from "@mui/icons-material/MusicNoteOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import NewspaperOutlinedIcon from "@mui/icons-material/NewspaperOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { INSTRUMENT_OPTIONS, LEVEL_OPTIONS } from "@/constants";
import { formatMemberDate } from "./utils";
import { toast } from "sonner";
import { userState } from "@/state/UserState";
import { observer } from "mobx-react";

export const EditUser = observer(() => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit: hookFormHandleSubmit,
    setValue,
    formState: { dirtyFields },
    reset,
  } = useForm<IEditUserFormData>();

  const getChangedFields = (
    data: IEditUserFormData,
  ): Partial<IEditUserFormData> => {
    const updated: Partial<IEditUserFormData> = {};

    if (dirtyFields.username) updated.username = data.username;
    if (dirtyFields.instrument) updated.instrument = data.instrument;
    if (dirtyFields.level) updated.level = data.level;
    if (dirtyFields.bio) updated.bio = data.bio;

    return updated;
  };

  const handleEditUser = async (formData: IEditUserFormData) => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return;

    const updatedFields = getChangedFields(formData);

    if (Object.keys(updatedFields).length === 0) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);

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
          body: JSON.stringify(updatedFields),
        },
      );

      if (!response.ok) {
        throw new Error("Erro na requisição");
      }

      toast.success("Perfil atualizado com sucesso!", {
        duration: 5000,
      });

      await userState.fetchUser();
      reset({
        username: userState.user?.username ?? "",
        instrument: userState.user?.instrument ?? "",
        level: userState.user?.level ?? "beginner",
        bio: userState.user?.bio ?? "",
      });

      setIsEditing(false);
    } catch (error) {
      toast.error("Erro ao atualizar perfil. Tente novamente.", {
        duration: 5000,
      });
      console.error("Erro ao atualizar usuário:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditButtonClick = () => {
    setIsEditing((previousState) => !previousState);
  };

  useEffect(() => {
    if (userState.user) {
      setValue("username", userState.user.username ?? "");
      setValue("instrument", userState.user.instrument ?? "");
      setValue("level", userState.user.level ?? "beginner");
      setValue("bio", userState.user.bio ?? "");
    }
  }, [userState.user]);

  return (
    <Content>
      <div className="bg-slate-950 min-h-screen p-4 md:p-8 -mt-2 -ml-2">
        <h1 className="text-white text-2xl text-center">Meu Perfil</h1>
        <form
          className="w-[70%] mx-auto mt-6 bg-slate-800 border border-[rgb(45,57,83)] rounded-md p-6 text-white"
          onSubmit={hookFormHandleSubmit(handleEditUser)}
        >
          <div className="p-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#5a3b3b] flex items-center justify-center text-orange-400 font-semibold">
              {userState.user?.username?.slice(0, 2).toUpperCase() || ""}
            </div>

            <div className="flex flex-col">
              <p className="text-white font-semibold text-sm">
                {userState.user?.username || "Nome do usuário"}
              </p>

              <p className="text-slate-400 text-xs flex items-center gap-1">
                <EmailOutlinedIcon fontSize="inherit" />
                {userState.user?.email || "email@email.com"}
              </p>

              <p className="text-slate-400 text-xs flex items-center gap-1 mt-1">
                <CalendarMonthOutlinedIcon fontSize="inherit" />
                Membro desde{" "}
                {userState.user?.createdAt &&
                  formatMemberDate(userState.user?.createdAt)}
              </p>
            </div>

            {!isEditing && (
              <button
                type="button"
                onClick={handleEditButtonClick}
                className="ml-auto h-8 px-3 rounded-md bg-slate-900 text-white text-sm hover:bg-slate-800 border border-[#2d3953]"
              >
                Editar
              </button>
            )}
          </div>
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
                className="w-full h-8 p-1.5 border border-[rgb(45, 57, 83)] bg-slate-900 rounded-md text-sm disabled:cursor-not-allowed disabled:opacity-80"
                disabled={!isEditing}
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

              <select
                {...register("instrument")}
                className="w-full h-8 px-2 bg-slate-900 text-white border border-[rgb(45,57,83)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-orange-600 disabled:cursor-not-allowed disabled:opacity-80"
                disabled={!isEditing}
              >
                {INSTRUMENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
            <select
              {...register("level")}
              className="w-full h-8 px-2 bg-slate-900 text-white border border-[rgb(45,57,83)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-orange-600 disabled:cursor-not-allowed disabled:opacity-80"
              disabled={!isEditing}
            >
              {LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <label
              htmlFor="bio"
              className="font-medium flex mb-[0.7rem] items-center gap-1"
            >
              <NewspaperOutlinedIcon fontSize="small" />
              Sobre mim
            </label>
            <textarea
              {...register("bio")}
              rows={3}
              placeholder={"Conte um pouco sobre sua jornada musical..."}
              className="w-full h-8 p-1.5 border border-[rgb(45, 57, 83)] bg-slate-900 flex min-h-20 w-full px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-80"
              disabled={!isEditing}
            ></textarea>
          </div>

          {isLoading ? (
            <div className="w-full flex items-center justify-center text-orange-600 mt-1">
              <CircularProgress color="inherit" />
            </div>
          ) : (
            <div className="flex justify-end gap-3 mt-6">
              {isEditing && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                    }}
                    className="h-10 px-4 rounded-md bg-slate-700 text-white text-sm hover:bg-slate-600 cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="h-10 px-4 rounded-md bg-orange-500 text-black text-sm hover:bg-orange-500/80 flex items-center gap-2 cursor-pointer"
                  >
                    <SaveOutlinedIcon fontSize="small" />
                    Salvar
                  </button>
                </>
              )}
            </div>
          )}
        </form>
      </div>
    </Content>
  );
});
