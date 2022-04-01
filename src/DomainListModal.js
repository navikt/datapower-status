import React from "react";
import Modal from "@mui/material/Modal";
import { makeStyles } from "@mui/styles";
import Button from "@mui/material/Button";
import ListAltOutlined from "@mui/icons-material/List";

function rand() {
  return Math.round(Math.random() * 20) - 10;
}

function getModalStyle() {
  const top = 50 + rand();
  const left = 50 + rand();

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

//const theme = createTheme();
const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    overflow: "scroll",
    height: "50%",
  },
}));

export default function DomainListModal(props) {
  //console.log(props.domains);
  const classes = useStyles();
  const [modalStyle] = React.useState(getModalStyle);
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  return (
    <div>
      <Button
        variant="outlined"
        size="small"
        onClick={handleOpen}
        endIcon={<ListAltOutlined />}
      >
        Domains
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div style={modalStyle} className={classes.paper}>
          <ul>
            {props.domains.map((domain) => (
              <ul>{domain}</ul>
            ))}
          </ul>
        </div>
      </Modal>
    </div>
  );
}
