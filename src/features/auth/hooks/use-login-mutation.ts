import { useMutation } from "@tanstack/react-query";
import { loginService } from "@/features/auth/services/auth-service";

export function useLoginMutation() {
  return useMutation({
    mutationFn: loginService
  });
}
