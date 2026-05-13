package vetrural.mvc.entity;

import jakarta.persistence.*;
import lombok.*;
import vetrural.mvc.enumerations.TipoUsuarioEnum;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Usuario")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idUsuario;

    private String nombre;
    private String apellido;
    private String contrasena;
    private String email;

    @Enumerated(EnumType.STRING)
    private TipoUsuarioEnum tipo;

    @ManyToMany(mappedBy = "usuarios")
    private List<Establecimiento> establecimientos = new ArrayList<>();
}
