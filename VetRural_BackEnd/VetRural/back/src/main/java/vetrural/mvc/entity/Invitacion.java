package vetrural.mvc.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Invitacion")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Invitacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = jakarta.persistence.FetchType.EAGER)
    @JoinColumn(name = "establecimiento_id")
    private Establecimiento establecimiento;

    @ManyToOne(optional = false, fetch = jakarta.persistence.FetchType.EAGER)
    @JoinColumn(name = "usuario_invitado_id")
    private Usuario usuarioInvitado;

    @ManyToOne(optional = false, fetch = jakarta.persistence.FetchType.EAGER)
    @JoinColumn(name = "remitente_id")
    private Usuario remitente;

    private LocalDateTime fecha = LocalDateTime.now();
}
