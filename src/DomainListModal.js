import React from "react";
import Modal from "@mui/material/Modal";
import Box from '@mui/material/Box';
import Button from "@mui/material/Button";
import Typography from '@mui/material/Typography';
import ListAltOutlined from "@mui/icons-material/List";

const style = {
  position: 'absolute',
  top: '50%',
  left: '30%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  height: "50%",
  overflow: "scroll",
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: [2, 4, 3],
};


export default function DomainListModal(props) {
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
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Domains on {props.dpInstance}:
          </Typography>
          <Typography  id="modal-modal-description" sx={{ mt: 2 }}>
            <ul>
              {props.domains.map((domain) => (
                <ul>{domain}</ul>
              ))}
            </ul>
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}
