package vetrural.mvc.entity;

import jakarta.persistence.*;
import lombok.*;
import vetrural.mvc.enumerations.TipoUsuarioEnum;
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

    @ElementCollection
    @CollectionTable(
        name = "usuario_establecimientos",
        joinColumns = @JoinColumn(name = "id_usuario")
    )
    @Column(name = "establecimiento")
    private List<String> establecimientos;
}
