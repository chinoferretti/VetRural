package vetrural.mvc.controller;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import vetrural.mvc.dto.response.InvitacionResponse;
import vetrural.mvc.entity.Establecimiento;
import vetrural.mvc.entity.Invitacion;
import vetrural.mvc.entity.Usuario;
import vetrural.mvc.repository.InvitacionRepository;
import vetrural.mvc.service.EstablecimientoService;
import vetrural.mvc.service.UsuarioService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invitaciones")
public class InvitacionController {

    @Autowired private InvitacionRepository invitacionRepository;
    @Autowired private EstablecimientoService establecimientoService;
    @Autowired private UsuarioService usuarioService;

    private InvitacionResponse toResponse(Invitacion inv) {
        String rem      = (inv.getRemitente().getNombre()      + " " + inv.getRemitente().getApellido()).trim();
        String invitado = (inv.getUsuarioInvitado().getNombre() + " " + inv.getUsuarioInvitado().getApellido()).trim();
        return new InvitacionResponse(
            inv.getId(),
            inv.getEstablecimiento().getId(),
            inv.getEstablecimiento().getNombre(),
            rem,
            inv.getFecha(),
            invitado
        );
    }

    /** GET /api/invitaciones?usuarioId=X — pendientes para el usuario invitado */
    @GetMapping
    @Transactional(readOnly = true)
    public List<InvitacionResponse> listar(@RequestParam Long usuarioId) {
        return invitacionRepository.findByUsuarioInvitadoId(usuarioId).stream()
                .map(this::toResponse)
                .toList();
    }

    /** POST /api/invitaciones — crear invitación */
    @PostMapping
    @Transactional
    public ResponseEntity<InvitacionResponse> crear(@RequestBody Map<String, Long> body) {
        Long estId       = body.get("establecimientoId");
        Long invitadoId  = body.get("usuarioId");
        Long remitenteId = body.get("remitenteId");

        Establecimiento est  = establecimientoService.obtenerOFallar(estId);
        Usuario invitado     = usuarioService.obtenerOFallar(invitadoId);
        Usuario remitente    = usuarioService.obtenerOFallar(remitenteId);

        boolean yaMiembro = est.getUsuarios().stream()
                .anyMatch(u -> u.getIdUsuario().equals(invitadoId));
        if (yaMiembro) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.CONFLICT)
                    .body(null);
        }

        if (invitacionRepository.existsByEstablecimientoAndInvitado(estId, invitadoId)) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.CONFLICT)
                    .body(null);
        }

        Invitacion inv = new Invitacion();
        inv.setEstablecimiento(est);
        inv.setUsuarioInvitado(invitado);
        inv.setRemitente(remitente);
        Invitacion saved = invitacionRepository.save(inv);
        return ResponseEntity.ok(toResponse(saved));
    }

    /** POST /api/invitaciones/{id}/aceptar */
    @PostMapping("/{id}/aceptar")
    @Transactional
    public ResponseEntity<Void> aceptar(@PathVariable Long id) {
        Invitacion inv = invitacionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Invitación no encontrada: " + id));
        establecimientoService.asociarUsuario(
                inv.getEstablecimiento().getId(),
                inv.getUsuarioInvitado().getIdUsuario()
        );
        invitacionRepository.delete(inv);
        return ResponseEntity.noContent().build();
    }

    /** GET /api/invitaciones/establecimiento/{estId} — pendientes para un establecimiento */
    @GetMapping("/establecimiento/{estId}")
    @Transactional(readOnly = true)
    public List<InvitacionResponse> listarPorEstablecimiento(@PathVariable Long estId) {
        return invitacionRepository.findByEstablecimientoId(estId).stream()
                .map(this::toResponse)
                .toList();
    }

    /** DELETE /api/invitaciones/{id} — rechazar */
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> rechazar(@PathVariable Long id) {
        invitacionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Invitación no encontrada: " + id));
        invitacionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
