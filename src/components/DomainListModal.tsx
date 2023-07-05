import Modal from "@mui/material/Modal";
import Box from '@mui/material/Box';
import Button from "@mui/material/Button";
import Typography from '@mui/material/Typography';
import ListAlt from "@mui/icons-material/List";
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { red, green } from '@mui/material/colors';

import { useState } from 'react'
import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";

interface ModalProps {
  domains: string[],
  dpInstance: string
}


export default function DomainListModal({ domains, dpInstance }: ModalProps) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "enabled":
        return <DoneIcon sx={{ color: green[500] }}/>;
      case "disabled":
        return <CloseIcon sx={{ color: red[500] }}  />;
    }
  };

  return (
    <div>
      <Button
        variant="outlined"
        size="small"
        onClick={handleOpen}
        endIcon={<ListAlt />}
      >
        Domains
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <Box sx={{
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
        }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Domains on {dpInstance}:
          </Typography>
          <Box id="modal-modal-description" sx={{ mt: 0 }}>
            <List>
              {domains && (
                domains.map((domain: any ) => (
                  <ListItem disablePadding key={domain.domain}>
                    <ListItemButton>
                      <ListItemIcon>
                        { statusIcon(domain.mAdminState)}
                      </ListItemIcon>
                      <ListItemText >{domain.domain}</ListItemText>
                    </ListItemButton>
                  </ListItem>
                ))
              )}
            </List>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}
