import { BaseResponseSuccess, axiosClient } from "@/lib/axiosClient";
import {
  LoginPayload,
  LoginResponse,
  LupaPasswordPayload,
  ProfileResponse,
  ProfileUpdatePayload,
  RegisterPayload,
  RegisterResponse,
  ResetPasswordPayload,
} from "../interface";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hook/useToast";
import { signIn } from "next-auth/react";
import useAxiosAuth from "@/hook/useAuthAxios";
import { useSession } from "next-auth/react";
import useUploadFile from "@/hook/useUploadFile";

const useAuthModule = () => {
  const { toastError, toastSuccess, toastWarning } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const axiosAuthClient = useAxiosAuth();
  const { data: session } = useSession();
  const { uploadSingle } = useUploadFile();

  const register = async (
    payload: RegisterPayload
  ): Promise<RegisterResponse> => {
    if (payload.file !== undefined) {
      const res = await uploadSingle(payload.file);
      console.log("res", res);

      payload = {
        ...payload,
        avatar: res.data.file_url,
      };
    }
    return axiosClient
      .post(`/auth/register`, payload)
      .then((res) => res.data);
  };

  const login = async (
    payload: LoginPayload
  ): Promise<LoginResponse> => {
    return axiosClient
      .post("/auth/login", payload)
      .then((res) => res.data);
  };

  const useLogin = () => {
    const { mutate, isLoading } = useMutation(
      (payload: LoginPayload) => login(payload),
      {
        onSuccess: async (response) => {
          toastSuccess(response.message);
          await signIn("credentials", {
            id: response.data.id,
            name: response.data.nama,
            email: response.data.email,
            password: response.data.password,
            role: response.data.role,
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
            redirect: false,
          });

          if (response.data.role === 'guru') {
            router.push("/guru");
            queryClient.invalidateQueries(["auth/profile"]);
          } else if (response.data.role === 'siswa') {
            router.push("/siswa");
            queryClient.invalidateQueries(["auth/profile"]);
          } else {
            router.push("/home");
          }
        },
        onError: (error: any) => {
          if (error.response.status == 422) {
            toastWarning(error.response.data.message);
          } else {
            toastError();
          }
        },
      }
    );
    return { mutate, isLoading };
  };



  const getProfile = async (): Promise<ProfileResponse> => {
    return axiosAuthClient.get("auth/profile").then((res) => res.data);
  };

  const useProfile = () => {
    const { data, isLoading, isFetching } = useQuery(
      ["auth/profile"],
      () => getProfile(),
      {
        select: (response) => response,
        staleTime: 1000 * 60 * 60,
        refetchInterval: 1000 * 60 * 60,
        refetchOnWindowFocus: false,
        enabled: session?.user?.id !== undefined,
      }
    );

    return { data, isFetching, isLoading };
  };

  const updateProfile = async (
    payload: ProfileUpdatePayload
  ): Promise<ProfileResponse> => {
    if (payload.file !== undefined) {
      const res = await uploadSingle(payload.file);
      console.log("res", res);

      payload = {
        ...payload,
        avatar: res.data.file_url,
      };
    }

    return axiosAuthClient
      .put("profile/update", payload)
      .then((res) => res.data);
  };

  const useUpdateProfile = () => {
    const { mutate, isLoading } = useMutation(
      (payload: ProfileUpdatePayload) => updateProfile(payload),
      {
        onSuccess: async (response) => {
          toastSuccess(response.message);
          queryClient.invalidateQueries(["auth/profile"]);
        },
        onError: (error: any) => {
          if (error.response.status == 422) {
            return toastWarning(error.response.data.message);
          }

          if (error.response.status == 400) {
            return toastWarning(error.response.data.message.toString());
          }

          toastError();
        },
      }
    );

    return { mutate, isLoading };
  };


  const useRegister = () => {
    const { mutate, isLoading } = useMutation(
      (payload: RegisterPayload) => register(payload),
      {
        onSuccess: (response) => {
          toastSuccess(response.message);
          router.push("/login");
        },
        onError: (error) => {
          toastError();
        },
      }
    );
    return { mutate, isLoading };
  };


  const lupa_password = async (
    payload: LupaPasswordPayload
  ): Promise<BaseResponseSuccess> => {
    return axiosClient
      .post("/auth/lupa-password", payload)
      .then((res) => res.data);
  };

  const useLupaPassword = () => {
    const { mutate, isLoading } = useMutation(
      (payload: LupaPasswordPayload) => lupa_password(payload),
      {
        onSuccess: (res) => {
          toastSuccess(res.message);
          router.push("/login/guru");
        },
        onError: (error: any) => {
          if (error.response.status == 422) {
            toastWarning(error.response.data.message);
          } else {
            toastError();
          }
        },
      }
    );

    return { mutate, isLoading };
  };

  const ResetPassword = async (
    payload: ResetPasswordPayload,
    id: string,
    token: string
  ): Promise<BaseResponseSuccess> => {
    return axiosClient
      .post(`/auth/reset-password/${id}/${token}`, payload)
      .then((res) => res.data);
  };

  const useResetPassword = (id: string, token: string) => {
    const { mutate, isLoading } = useMutation(
      (payload: ResetPasswordPayload) => ResetPassword(payload, id, token),
      {
        onSuccess: (res) => {
          toastSuccess(res.message);
          router.push("/login/guru");
        },
        onError: (error: any) => {
          if (error.response.status == 422) {
            toastWarning(error.response.data.message);
          } else {
            toastError();
          }
        },
      }
    );

    return { mutate, isLoading };
  };

  return {
    useRegister,
    useResetPassword,
    useLupaPassword,
    useUpdateProfile,
    useLogin,
    useProfile
  };
};

export default useAuthModule;
