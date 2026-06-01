package vetrural.mvc.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vetrural.mvc.dto.request.LoginRequest;
import vetrural.mvc.dto.response.UsuarioResponse;
import vetrural.mvc.mapper.UsuarioMapper;
import vetrural.mvc.service.UsuarioService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/login")
    public ResponseEntity<UsuarioResponse> login(@Valid @RequestBody LoginRequest req) {
        return usuarioService.login(req.getEmail(), req.getContrasena())
                .map(UsuarioMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }
}
