package utn.frp.comp03.terceros.model;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
	
	@Entity
	@Table(name="terceros")
	public class Terceros {
		@Id
		@GeneratedValue(strategy = GenerationType.IDENTITY)
		@Column(name = "id_tercero")
		private Long id;
		
		@Column(name = "nombre")
		private String nombre;
		
		@Column(name = "direccion")
		private String direccion;
		
		@Column(name = "cuitl")
		private String cuitl;
		
		public enum SituacionIVA {
		    MONOTRIBUTO("Monotributo"),
		    RESPONSABLE_INSCRIPTO("Responsable Inscripto"),
		    CONSUMIDOR_FINAL("Consumidor Final");

		    private final String descripcion;

		    SituacionIVA(String descripcion) {
		        this.descripcion = descripcion;
		    }

		    public String getDescripcion() {
		        return descripcion;
		    }
		}
		
		@Convert(converter = SituacionIVAConverter.class)
		@Column(name = "sitiva")
		private SituacionIVA sitiva;
		
		@Column(name = "localidad")
		private String localidad;
		
		@Column(name = "provincia")
		private String provincia;
		
		@Column(name = "telefonos")
		private String telefonos;
		
		@Column(name = "saldo_apertura")
		private BigDecimal saldo_apertura;
		
		@Column(name = "tipo_saldo")
		private String tipo_saldo;

		public Long getId() {
			return id;
		}

		public void setId(Long id) {
			this.id = id;
		}

		public String getNombre() {
			return nombre;
		}

		public void setNombre(String nombre) {
			this.nombre = nombre;
		}

		public String getDireccion() {
			return direccion;
		}

		public void setDireccion(String direccion) {
			this.direccion = direccion;
		}

		public String getCuitl() {
			return cuitl;
		}

		public void setCuitl(String cuitl) {
			this.cuitl = cuitl;
		}

		public String getLocalidad() {
			return localidad;
		}

		public void setLocalidad(String localidad) {
			this.localidad = localidad;
		}

		public String getProvincia() {
			return provincia;
		}

		public void setProvincia(String provincia) {
			this.provincia = provincia;
		}

		public String getTelefonos() {
			return telefonos;
		}

		public void setTelefonos(String telefonos) {
			this.telefonos = telefonos;
		}

		public BigDecimal getSaldo_apertura() {
			return saldo_apertura;
		}

		public void setSaldo_apertura(BigDecimal saldo_apertura) {
			this.saldo_apertura = saldo_apertura;
		}

		public String getTipo_saldo() {
			return tipo_saldo;
		}

		public void setTipo_saldo(String tipo_saldo) {
			this.tipo_saldo = tipo_saldo;
		}

		public SituacionIVA getSitiva() {
			return sitiva;
		}

		public void setSitiva(SituacionIVA sitiva) {
			this.sitiva = sitiva;
		}

}